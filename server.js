const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://hdominik1001_db_user:4X9Gl6CIK37ssp42@kencsar.qyhuxlp.mongodb.net/nullsec?retryWrites=true&w=majority&appName=kencsar";
const OWNER = "kencsar";

const BADGES = {
    owner: { emoji: "\u{1F451}", label: "Platform Owner" },
    staff: { emoji: "\u{1F6E1}\uFE0F", label: "Staff" },
    early: { emoji: "\u26A1", label: "Early Supporter" },
    bughunter: { emoji: "\u{1F41B}", label: "Bug Hunter" },
    active: { emoji: "\u{1F525}", label: "Active User" },
    premium: { emoji: "\u{1F48E}", label: "Premium" },
    gamer: { emoji: "\u{1F3AE}", label: "Gamer" },
    botdev: { emoji: "\u{1F916}", label: "Bot Developer" },
    designer: { emoji: "\u{1F3A8}", label: "Designer" },
    og: { emoji: "\u{1F480}", label: "OG" }
};

mongoose.connect(MONGO_URI).then(() => console.log("[NullSec] MongoDB connected")).catch(err => console.error("[NullSec] MongoDB error:", err.message));

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    color: String,
    role: { type: String, default: "member" },
    avatar: { type: String, default: "" },
    badges: { type: [String], default: [] },
    banned: { type: Boolean, default: false },
    muted: { type: Boolean, default: false },
    created: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
    channel: { type: String, required: true },
    username: String,
    color: String,
    role: String,
    avatar: String,
    badges: [String],
    text: String,
    image: String,
    edited: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    deletedBy: { type: String, default: "" },
    reactions: { type: Object, default: {} },
    timestamp: { type: Date, default: Date.now }
});

const dmSchema = new mongoose.Schema({
    from: String, to: String, text: String, image: String,
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

const channelSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    createdBy: String,
    created: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Message = mongoose.model("Message", messageSchema);
const DM = mongoose.model("DM", dmSchema);
const Channel = mongoose.model("Channel", channelSchema);

function hashPassword(p) { return crypto.createHash("sha256").update(p).digest("hex"); }
const COLORS = ["#00ff88","#ff3366","#33aaff","#ffaa00","#aa55ff","#ff5500","#00ddcc","#ff69b4"];
const DEFAULT_CHANNELS = ["general","offtopic","dev","memes"];
(async () => { for (const ch of DEFAULT_CHANNELS) await Channel.updateOne({ name: ch }, { name: ch, createdBy: "system" }, { upsert: true }); })();

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } });

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadsDir));

const ROLE_POWER = { owner: 4, admin: 3, mod: 2, member: 1 };
function canManage(myRole, targetRole) { return (ROLE_POWER[myRole] || 0) > (ROLE_POWER[targetRole] || 0); }

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });
    if (username.length < 3 || username.length > 20) return res.status(400).json({ error: "Username 3-20 chars" });
    if (password.length < 4) return res.status(400).json({ error: "Password min 4 chars" });
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.status(400).json({ error: "Letters, numbers, _ only" });
    const exists = await User.findOne({ username: username.toLowerCase() });
    if (exists) return res.status(400).json({ error: "Username taken" });
    const role = username.toLowerCase() === OWNER ? "owner" : "member";
    const badges = role === "owner" ? ["owner"] : [];
    const user = new User({ username: username.toLowerCase(), password: hashPassword(password), color: COLORS[Math.floor(Math.random() * COLORS.length)], role, badges });
    await user.save();
    res.json({ success: true, username: user.username, role: user.role, color: user.color, badges: user.badges, avatar: "" });
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Fill both fields" });
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(400).json({ error: "User not found" });
    if (user.banned) return res.status(400).json({ error: "You are banned" });
    if (user.password !== hashPassword(password)) return res.status(400).json({ error: "Wrong password" });
    user.lastSeen = new Date(); await user.save();
    res.json({ success: true, username: user.username, role: user.role, color: user.color, avatar: user.avatar, badges: user.badges });
});

app.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file" });
    res.json({ url: "/uploads/" + req.file.filename });
});

app.post("/setAvatar", upload.single("image"), async (req, res) => {
    if (!req.file || !req.body.username) return res.status(400).json({ error: "No file or username" });
    const url = "/uploads/" + req.file.filename;
    await User.updateOne({ username: req.body.username.toLowerCase() }, { avatar: url });
    res.json({ url });
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
    let currentChannel = "general";
    let myUser = null;

    socket.on("join", async (data) => {
        const user = await User.findOne({ username: data.username.toLowerCase() });
        if (!user || user.banned) return;
        myUser = user;
        onlineUsers.set(socket.id, { username: user.username, color: user.color, role: user.role, avatar: user.avatar, badges: user.badges });
        socket.join(currentChannel);
        const channels = await Channel.find().sort({ created: 1 });
        const messages = await Message.find({ channel: currentChannel }).sort({ timestamp: -1 }).limit(50);
        messages.reverse();
        const allUsers = await User.find().select("username color role avatar badges banned muted created lastSeen").sort({ created: 1 });
        socket.emit("init", {
            channels: channels.map(c => c.name),
            messages: messages.map(m => ({ _id: m._id, username: m.username, color: m.color, role: m.role, avatar: m.avatar, badges: m.badges, text: m.text, image: m.image, edited: m.edited, deleted: m.deleted, deletedBy: m.deletedBy, reactions: m.reactions, timestamp: m.timestamp })),
            users: Array.from(onlineUsers.values()),
            allUsers: allUsers.map(u => ({ username: u.username, color: u.color, role: u.role, avatar: u.avatar, badges: u.badges, banned: u.banned, created: u.created, lastSeen: u.lastSeen })),
            channel: currentChannel,
            username: user.username, color: user.color, role: user.role, avatar: user.avatar, badges: user.badges,
            badgeList: BADGES
        });
        io.emit("userlist", Array.from(onlineUsers.values()));
        io.to(currentChannel).emit("system", user.username + " joined");
    });

    socket.on("message", async (data) => {
        if (!myUser) return;
        const user = await User.findOne({ username: myUser.username });
        if (!user || user.muted) return;
        const msg = new Message({ channel: currentChannel, username: user.username, color: user.color, role: user.role, avatar: user.avatar, badges: user.badges, text: data.text, image: data.image || null });
        await msg.save();
        io.to(currentChannel).emit("message", { _id: msg._id, username: msg.username, color: msg.color, role: msg.role, avatar: msg.avatar, badges: msg.badges, text: msg.text, image: msg.image, edited: false, deleted: false, deletedBy: "", reactions: {}, timestamp: msg.timestamp });
    });

    socket.on("editMessage", async (data) => {
        if (!myUser) return;
        const msg = await Message.findById(data.id);
        if (!msg || msg.username !== myUser.username) return;
        msg.text = data.text; msg.edited = true; await msg.save();
        io.to(currentChannel).emit("messageEdited", { id: data.id, text: data.text });
    });

    socket.on("deleteMessage", async (data) => {
        if (!myUser) return;
        const msg = await Message.findById(data.id);
        if (!msg) return;
        const user = await User.findOne({ username: myUser.username });
        if (msg.username !== myUser.username && !canManage(user.role, "member")) return;
        msg.deleted = true;
        msg.deletedBy = myUser.username;
        await msg.save();
        io.to(currentChannel).emit("messageDeleted", { id: data.id, deletedBy: myUser.username });
    });

    socket.on("react", async (data) => {
        const msg = await Message.findById(data.id);
        if (!msg) return;
        if (!msg.reactions) msg.reactions = {};
        if (!msg.reactions[data.emoji]) msg.reactions[data.emoji] = [];
        const idx = msg.reactions[data.emoji].indexOf(myUser.username);
        if (idx > -1) msg.reactions[data.emoji].splice(idx, 1);
        else msg.reactions[data.emoji].push(myUser.username);
        msg.markModified("reactions"); await msg.save();
        io.to(currentChannel).emit("messageReacted", { id: data.id, reactions: msg.reactions });
    });

    socket.on("switchChannel", async (channel) => {
        const ch = await Channel.findOne({ name: channel });
        if (!ch) return;
        socket.leave(currentChannel); currentChannel = channel; socket.join(currentChannel);
        const messages = await Message.find({ channel }).sort({ timestamp: -1 }).limit(50);
        messages.reverse();
        socket.emit("channelHistory", { channel, messages: messages.map(m => ({ _id: m._id, username: m.username, color: m.color, role: m.role, avatar: m.avatar, badges: m.badges, text: m.text, image: m.image, edited: m.edited, deleted: m.deleted, deletedBy: m.deletedBy, reactions: m.reactions, timestamp: m.timestamp })) });
    });

    socket.on("sendDM", async (data) => {
        if (!myUser) return;
        const dm = new DM({ from: myUser.username, to: data.to.toLowerCase(), text: data.text, image: data.image });
        await dm.save();
        for (const [sid, u] of onlineUsers) { if (u.username === data.to.toLowerCase()) io.to(sid).emit("newDM", { from: myUser.username, text: data.text, image: data.image, timestamp: dm.timestamp }); }
        socket.emit("dmSent", { to: data.to, text: data.text, timestamp: dm.timestamp });
    });

    socket.on("getDMs", async (data) => {
        if (!myUser) return;
        const dms = await DM.find({ $or: [{ from: myUser.username, to: data.with }, { from: data.with, to: myUser.username }] }).sort({ timestamp: -1 }).limit(50);
        dms.reverse();
        socket.emit("dmHistory", { with: data.with, messages: dms });
    });

    socket.on("admin", async (data) => {
        if (!myUser) return;
        const me = await User.findOne({ username: myUser.username });
        if (!me) return;

        if (data.action === "setRole") {
            if (!canManage(me.role, data.role) && me.role !== "owner") return;
            const target = await User.findOne({ username: data.target.toLowerCase() });
            if (!target) return;
            if (!canManage(me.role, target.role) && me.role !== "owner") return;
            target.role = data.role; await target.save();
            io.emit("system", data.target + " is now " + data.role);
            for (const [sid, u] of onlineUsers) { if (u.username === target.username) { u.role = data.role; break; } }
            io.emit("userlist", Array.from(onlineUsers.values()));
        }
        if (data.action === "ban") {
            if (!canManage(me.role, "member")) return;
            const target = await User.findOne({ username: data.target.toLowerCase() });
            if (!target || !canManage(me.role, target.role)) return;
            target.banned = true; await target.save();
            for (const [sid, u] of onlineUsers) { if (u.username === target.username) { io.to(sid).emit("kicked", "You have been banned"); break; } }
            io.emit("system", data.target + " was banned");
        }
        if (data.action === "unban") { if (!canManage(me.role, "member")) return; await User.updateOne({ username: data.target.toLowerCase() }, { banned: false }); io.emit("system", data.target + " was unbanned"); }
        if (data.action === "mute") { if (!canManage(me.role, "member")) return; await User.updateOne({ username: data.target.toLowerCase() }, { muted: true }); io.emit("system", data.target + " was muted"); }
        if (data.action === "unmute") { if (!canManage(me.role, "member")) return; await User.updateOne({ username: data.target.toLowerCase() }, { muted: false }); io.emit("system", data.target + " was unmuted"); }
        if (data.action === "createChannel") {
            if (ROLE_POWER[me.role] < 3) return;
            const exists = await Channel.findOne({ name: data.name.toLowerCase() });
            if (exists) return;
            await new Channel({ name: data.name.toLowerCase(), createdBy: me.username }).save();
            const channels = await Channel.find().sort({ created: 1 });
            io.emit("channelList", channels.map(c => c.name));
            io.emit("system", "Channel #" + data.name + " created");
        }
        if (data.action === "deleteChannel") {
            if (me.role !== "owner") return;
            if (DEFAULT_CHANNELS.includes(data.name)) return;
            await Channel.deleteOne({ name: data.name }); await Message.deleteMany({ channel: data.name });
            const channels = await Channel.find().sort({ created: 1 });
            io.emit("channelList", channels.map(c => c.name));
            io.emit("system", "Channel #" + data.name + " deleted");
        }
        if (data.action === "getUsers") {
            if (ROLE_POWER[me.role] < 2) return;
            const users = await User.find().select("username role badges banned muted created lastSeen");
            socket.emit("adminUserList", users);
        }
        if (data.action === "addBadge") {
            if (me.role !== "owner") return;
            const target = await User.findOne({ username: data.target.toLowerCase() });
            if (!target) return;
            if (!target.badges.includes(data.badge)) { target.badges.push(data.badge); await target.save(); }
            io.emit("system", data.target + " received badge: " + (BADGES[data.badge] ? BADGES[data.badge].label : data.badge));
            for (const [sid, u] of onlineUsers) { if (u.username === target.username) { u.badges = target.badges; break; } }
            io.emit("userlist", Array.from(onlineUsers.values()));
        }
        if (data.action === "removeBadge") {
            if (me.role !== "owner") return;
            const target = await User.findOne({ username: data.target.toLowerCase() });
            if (!target) return;
            target.badges = target.badges.filter(b => b !== data.badge); await target.save();
            for (const [sid, u] of onlineUsers) { if (u.username === target.username) { u.badges = target.badges; break; } }
            io.emit("userlist", Array.from(onlineUsers.values()));
        }
    });

    socket.on("typing", () => { if (myUser) socket.to(currentChannel).emit("typing", myUser.username); });
    socket.on("disconnect", () => {
        if (myUser) { io.emit("system", myUser.username + " left"); onlineUsers.delete(socket.id); io.emit("userlist", Array.from(onlineUsers.values())); }
    });
});

server.listen(PORT, () => console.log("[NullSec] Running on port " + PORT));
