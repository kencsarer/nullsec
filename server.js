const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Create folders
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// User database (JSON file)
const usersFile = path.join(dataDir, 'users.json');
const messagesFile = path.join(dataDir, 'messages.json');

function loadUsers() {
    if (!fs.existsSync(usersFile)) return {};
    return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
}
function saveUsers(users) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}
function loadMessages() {
    if (!fs.existsSync(messagesFile)) return { general: [], offtopic: [], dev: [], memes: [] };
    return JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
}
function saveMessages(messages) {
    fs.writeFileSync(messagesFile, JSON.stringify(messages));
}

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

// Auth endpoints
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    if (username.length < 3 || username.length > 20) return res.status(400).json({ error: 'Username must be 3-20 characters' });
    if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });

    const users = loadUsers();
    if (users[username.toLowerCase()]) return res.status(400).json({ error: 'Username already taken' });

    users[username.toLowerCase()] = {
        username: username,
        password: hashPassword(password),
        created: Date.now(),
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
    saveUsers(users);
    res.json({ success: true, username: username });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const users = loadUsers();
    const user = users[username.toLowerCase()];
    if (!user) return res.status(400).json({ error: 'User not found' });
    if (user.password !== hashPassword(password)) return res.status(400).json({ error: 'Wrong password' });

    res.json({ success: true, username: user.username, color: user.color });
});

// Image upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    res.json({ url: '/uploads/' + req.file.filename });
});

const COLORS = ['#00ff88', '#ff3366', '#33aaff', '#ffaa00', '#aa55ff', '#ff5500', '#00ddcc', '#ff69b4'];

// In-memory state
const channels = loadMessages();
const onlineUsers = new Map(); // socketId -> { username, color }

io.on('connection', (socket) => {
    let currentChannel = 'general';

    socket.on('join', (data) => {
        const users = loadUsers();
        const user = users[data.username.toLowerCase()];
        if (!user) return;

        const color = user.color || COLORS[Math.floor(Math.random() * COLORS.length)];
        onlineUsers.set(socket.id, { username: user.username, color });
        socket.join(currentChannel);

        // Send channel list and history
        socket.emit('init', {
            channels: Object.keys(channels),
            messages: (channels[currentChannel] || []).slice(-50),
            users: Array.from(onlineUsers.values()).map(u => u.username),
            channel: currentChannel,
            username: user.username,
            color: color
        });

        io.emit('userlist', Array.from(onlineUsers.values()).map(u => u.username));
        io.to(currentChannel).emit('system', `${user.username} joined`);
    });

    socket.on('message', (data) => {
        const user = onlineUsers.get(socket.id);
        if (!user) return;
        const msg = {
            id: Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            username: user.username,
            color: user.color,
            text: data.text,
            image: data.image || null,
            timestamp: Date.now()
        };
        if (!channels[currentChannel]) channels[currentChannel] = [];
        channels[currentChannel].push(msg);
        if (channels[currentChannel].length > 200) channels[currentChannel].shift();
        saveMessages(channels);
        io.to(currentChannel).emit('message', msg);
    });

    socket.on('switchChannel', (channel) => {
        if (!channels[channel]) channels[channel] = [];
        socket.leave(currentChannel);
        currentChannel = channel;
        socket.join(currentChannel);
        socket.emit('channelHistory', {
            channel,
            messages: (channels[currentChannel] || []).slice(-50)
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
