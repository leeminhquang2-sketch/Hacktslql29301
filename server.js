// server.js - API Server
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const ADMIN_PASSWORD = 'admin123';
const PORT = 3000;

function loadJSON(file) {
    try { if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch(e) {}
    return {};
}

function saveJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function generateKey(userId, username, duration) {
    const keys = loadJSON('./keys.json');
    const key = 'CHAR-' + crypto.randomBytes(8).toString('hex').toUpperCase();
    const now = Date.now();
    const durations = {
        '1h': 3600000, '1d': 86400000, '7d': 604800000,
     app.get('/admin',   '30d': 2592000000, 'perm': 9999999999999
    };
    keys[key] = {
        userId, username,
        created: now,
        expiry: now + (durations[duration] || 2592000000),
        duration, active: true, usedCount: 0
    };
    saveJSON('./keys.json', keys);
    return key;
}

function validateKey(key, userId) {
    const keys = loadJSON('./keys.json');
    const keyData = keys[key];
    if (!keyData) return { valid: false, msg: '❌ Key không tồn tại!' };
    if (!keyData.active) return { valid: false, msg: '❌ Key đã bị vô hiệu hóa!' };
    if (Date.now() > keyData.expiry) return { valid: false, msg: '❌ Key đã hết hạn!' };
    if (keyData.userId !== userId) return { valid: false, msg: '❌ Key không thuộc về bạn!' };
    return { valid: true, msg: '✅ Key hợp lệ!' };
}

function addLog(data) {
    const logs = loadJSON('./logs.json');
    const logArray = logs.logs || [];
    logArray.push({ ...data, timestamp: Date.now(), id: crypto.randomBytes(4).toString('hex') });
    if (logArray.length > 1000) logArray.splice(0, logArray.length - 1000);
    logs.logs = logArray;
    saveJSON('./logs.json', logs);
}

// ========== API ROUTES ==========

app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        const token = crypto.randomBytes(32).toString('hex');
        res.json({ success: true, token });
    } else {
        res.json({ success: false, msg: 'Sai mật khẩu!' });
    }
});

app.get('/api/admin/keys', (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const keys = loadJSON('./keys.json');
    const keyList = Object.entries(keys).map(([key, data]) => ({
        key, ...data,
        expired: Date.now() > data.expiry,
        timeLeft: Math.max(0, data.expiry - Date.now())
    }));
    res.json(keyList);
});

app.post('/api/admin/create-key', (req, res) => {
    const { token, userId, username, duration } = req.body;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const newKey = generateKey(userId, username, duration);
    res.json({ success: true, key: newKey });
});

app.post('/api/admin/delete-key', (req, res) => {
    const { token, key } = req.body;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const keys = loadJSON('./keys.json');
    delete keys[key];
    saveJSON('./keys.json', keys);
    res.json({ success: true, msg: 'Đã xóa key!' });
});

app.post('/api/admin/toggle-key', (req, res) => {
    const { token, key } = req.body;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const keys = loadJSON('./keys.json');
    if (keys[key]) {
        keys[key].active = !keys[key].active;
        saveJSON('./keys.json', keys);
        res.json({ success: true, active: keys[key].active });
    } else {
        res.json({ success: false, msg: 'Key không tồn tại!' });
    }
});

app.get('/api/admin/logs', (req, res) => {
    const { token, limit = 50 } = req.query;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const logs = loadJSON('./logs.json');
    const logList = (logs.logs || []).slice(-limit).reverse();
    res.json(logList);
});

app.get('/api/admin/users', (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const keys = loadJSON('./keys.json');
    const users = {};
    Object.values(keys).forEach(data => {
        if (!users[data.userId]) {
            users[data.userId] = { userId: data.userId, username: data.username, keyCount: 0, activeKeys: 0 };
        }
        users[data.userId].keyCount++;
        if (data.active && Date.now() <= data.expiry) users[data.userId].activeKeys++;
    });
    res.json(Object.values(users));
});

app.post('/api/check-key', (req, res) => {
    const { key, userId } = req.body;
    const result = validateKey(key, userId);
    res.json(result);
});

app.post('/api/log-hack', (req, res) => {
    const { key, userId, username, hostId, platform, charId, charName, success, error } = req.body;
    addLog({ key, userId, username, hostId, platform, charId, charName, success, error: error || null });
    res.json({ success: true });
});

app.post('/api/hack', async (req, res) => {
    const { key, userId, hostId, platform, charId } = req.body;
    
    const keyCheck = validateKey(key, userId);
    if (!keyCheck.valid) {
        return res.json({ success: false, msg: keyCheck.msg });
    }
    
    try {
        const hackModule = require('./hack_core.js');
        const result = await hackModule.hackChar(hostId, platform, charId, '100', '100');
        const charName = hackModule.getCharName(charId);
        
        addLog({ key, userId, hostId, platform, charId, charName, success: true });
        
        res.json({ success: true, msg: `✅ Nhận Thành Công ${charName} ⭐7` });
    } catch(error) {
        addLog({ key, userId, hostId, platform, charId, success: false, error: error.message });
        res.json({ success: false, msg: '❌ Hack thất bại!' });
    }
});

 app.get('/admin', (req, res) => {
    res.sendFile('/data/data/com.termux/files/home/botel/public/admin.html');
});

app.listen(PORT, () => {
    console.log('╔══════════════════════════════════╗');
    console.log('║  CHAR HACK SERVER ⭐7 SAO      ║');
    console.log('╚══════════════════════════════════╝');
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`👑 Admin: http://localhost:${PORT}/admin`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
    console.log('🚀 Sẵn sàng!\n');
});