const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://hdominik1001_db_user:4X9Gl6CIK37ssp42@kencsar.qyhuxlp.mongodb.net/nullsec?retryWrites=true&w=majority&appName=kencsar';

// MongoDB connection
mongoose.connect(MONGO_URI).then(() => {
    console.log('[NullSec] MongoDB connected');
}).catch(err => {
    console.error('[NullSec] MongoDB error:', err.message);
});

// Schemas
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    color: String,
    created: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
    channel: { type: String, required: true },
    username: String,
    color: String,
    text: String,
    image: String,
    timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

const COLORS = ['#00ff88', '#ff3366', '#33aaff', '#ffaa00', '#aa55ff', '#ff5500', '#00ddcc', '#ff69b4'];
const CHANNELS = ['general', 'offtopic', 'dev', 'memes'];

// Auth
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    if (username.length < 3 || username.length > 20) return res.status(400).json({ error: 'Username must be 3-20 characters' });
    if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });

    const exists = await User.findOne({ username: username.toLowerCase() });
    if (exists) return res.status(400).json({ error: 'Username already taken' });

    const user = new User({
        username: username.toLowerCase(),
        password: hashPassword(password),
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
    });
    await user.save();
    res.json({ success: true, username: user.username });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(400).json({ error: 'User not found' });
    if (user.password !== hashPassword(password)) return res.status(400).json({ error: 'Wrong password' });

    res.json({ success: true, username: user.username, color: user.color });
});

// Upload
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    res.json({ url: '/uploads/' + req.file.filename });
});

// Socket
const onlineUsers = new Map();

io.on('connection', (socket) => {
    let currentChannel = 'general';

    socket.on('join', async (data) => {
        const user = await User.findOne({ username: data.username.toLowerCase() });
        if (!user) return;

        onlineUsers.set(socket.id, { username: user.username, color: user.color });
        socket.join(currentChannel);

        const messages = await Message.find({ channel: currentChannel }).sort({ timestamp: -1 }).limit(50);
        messages.reverse();

        socket.emit('init', {
            channels: CHANNELS,
            messages: messages.map(m => ({ username: m.username, color: m.color, text: m.text, image: m.image, timestamp: m.timestamp })),
            users: Array.from(onlineUsers.values()).map(u => u.username),
            channel: currentChannel,
            username: user.username,
            color: user.color
        });

        io.emit('userlist', Array.from(onlineUsers.values()).map(u => u.username));
        io.to(currentChannel).emit('system', `${user.username} joined`);
    });

    socket.on('message', async (data) => {
        const user = onlineUsers.get(socket.id);
        if (!user) return;

        const msg = new Message({
            channel: currentChannel,
            username: user.username,
            color: user.color,
            text: data.text,
            image: data.image || null
        });
        await msg.save();

        io.to(currentChannel).emit('message', {
            username: msg.username,
            color: msg.color,
            text: msg.text,
            image: msg.image,
            timestamp: msg.timestamp
        });
    });

    socket.on('switchChannel', async (channel) => {
        if (!CHANNELS.includes(channel)) return;
        socket.leave(currentChannel);
        currentChannel = channel;
        socket.join(currentChannel);

        const messages = await Message.find({ channel }).sort({ timestamp: -1 }).limit(50);
        messages.reverse();

        socket.emit('channelHistory', {
            channel,
            messages: messages.map(m => ({ username: m.username, color: m.color, text: m.text, image: m.image, timestamp: m.timestamp }))
        });
    });

    socket.on('typing', () => {
        const user = onlineUsers.get(socket.id);
        if (user) socket.to(currentChannel).emit('typing', user.username);
    });

    socket.on('disconnect', () => {
        const user = onlineUsers.get(socket.id);
        if (user) {
            io.emit('system', `${user.username} left`);
            onlineUsers.delete(socket.id);
            io.emit('userlist', Array.from(onlineUsers.values()).map(u => u.username));
        }
    });
});

server.listen(PORT, () => {
    console.log(`[NullSec] Running on port ${PORT}`);
});
