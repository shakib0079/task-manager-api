const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Register
router.post('/register', async (req, res) => {
try {
const { name, email, password } = req.body;
if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });


const existing = await db.query('SELECT id FROM users WHERE email=$1', [email]);
if (existing.rows.length) return res.status(400).json({ message: 'Email already registered' });


const hashed = await bcrypt.hash(password, 10);
const result = await db.query(
'INSERT INTO users(name, email, password) VALUES($1,$2,$3) RETURNING id, name, email, created_at',
[name, email, hashed]
);


const user = result.rows[0];
res.status(201).json({ user });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Server error' });
}
});


// Login
router.post('/login', async (req, res) => {
try {
const { email, password } = req.body;
if (!email || !password) return res.status(400).json({ message: 'Missing fields' });


const result = await db.query('SELECT id, email, password, name FROM users WHERE email=$1', [email]);
if (!result.rows.length) return res.status(400).json({ message: 'Invalid credentials' });


const user = result.rows[0];
const match = await bcrypt.compare(password, user.password);
if (!match) return res.status(400).json({ message: 'Invalid credentials' });


const payload = { id: user.id, email: user.email };
const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });


res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Server error' });
}
});


module.exports = router;