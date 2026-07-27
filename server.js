const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Create uploads folder
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

// Image upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    res.json({ url: '/uploads/' + req.file.filename });
});

// In-memory storage (replace with DB for persistence)
const channels = {
    general: { name: 'general', messages: [] },
    offtopic: { name: 'offtopic', messages: [] },
    dev: { name: 'dev', messages: [] },
    memes: { name: 'memes', messages: [] }
};
const users = new Map(); // socketId -> { username, color }

const COLORS = ['#00ff88', '#ff3366', '#33aaff', '#ffaa00', '#aa55ff', '#ff5500', '#00ddcc', '#ff69b4'];

io.on('connection', (socket) => {
    let currentChannel = 'general';

    socket.on('join', (username) => {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        users.set(socket.id, { username, color });
        socket.join(currentChannel);

        // Send channel list and history
        socket.emit('init', {
            channels: Object.keys(channels),
            messages: channels[currentChannel].messages.slice(-50),
            users: Array.from(users.values()).map(u => u.username),
            channel: currentChannel
        });

        // Notify others
        io.emit('userlist', Array.from(users.values()).map(u => u.username));
        io.to(currentChannel).emit('system', `${username} joined`);
    });

    socket.on('message', (data) => {
        const user = users.get(socket.id);
        if (!user) return;
        const msg = {
            id: Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            username: user.username,
            color: user.color,
            text: data.text,
            image: data.image || null,
            timestamp: Date.now()
        };
        channels[currentChannel].messages.push(msg);
        // Keep last 200 messages per channel
        if (channels[currentChannel].messages.length > 200) {
            channels[currentChannel].messages.shift();
        }
        io.to(currentChannel).emit('message', msg);
    });

    socket.on('switchChannel', (channel) => {
        if (!channels[channel]) return;
        socket.leave(currentChannel);
        currentChannel = channel;
        socket.join(currentChannel);
        socket.emit('channelHistory', {
            channel,
            messages: channels[currentChannel].messages.slice(-50)
        });
    });

    socket.on('typing', () => {
        const user = users.get(socket.id);
        if (user) {
            socket.to(currentChannel).emit('typing', user.username);
        }
    });

    socket.on('disconnect', () => {
        const user = users.get(socket.id);
        if (user) {
            io.emit('system', `${user.username} left`);
            users.delete(socket.id);
            io.emit('userlist', Array.from(users.values()).map(u => u.username));
        }
    });
});

server.listen(PORT, () => {
    console.log(`[NullSec] Running on port ${PORT}`);
});
