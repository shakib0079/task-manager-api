const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');


// All routes protected
router.use(auth);


// GET /api/tasks -> all tasks for logged-in user
router.get('/', async (req, res) => {
try {
const result = await db.query('SELECT id, title, description, status, created_at FROM tasks WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]);
res.json({ tasks: result.rows });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Server error' });
}
});


// POST /api/tasks -> create
router.post('/', async (req, res) => {
try {
const { title, description } = req.body;
if (!title) return res.status(400).json({ message: 'Title required' });


const result = await db.query(
'INSERT INTO tasks(user_id, title, description) VALUES($1,$2,$3) RETURNING id, title, description, status, created_at',
[req.user.id, title, description || null]
);


res.status(201).json({ task: result.rows[0] });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Server error' });
}
});


// PUT /api/tasks/:id -> update
router.put('/:id', async (req, res) => {
try {
const { id } = req.params;
const { title, description, status } = req.body;


// check ownership
const check = await db.query('SELECT id FROM tasks WHERE id=$1 AND user_id=$2', [id, req.user.id]);
if (!check.rows.length) return res.status(404).json({ message: 'Task not found' });


const updated = await db.query(
'UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description), status = COALESCE($3, status) WHERE id=$4 RETURNING id, title, description, status, created_at',
[title, description, status, id]
);


res.json({ task: updated.rows[0] });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Server error' });
}
});


// DELETE /api/tasks/:id -> delete
router.delete('/:id', async (req, res) => {
try {
const { id } = req.params;
const check = await db.query('SELECT id FROM tasks WHERE id=$1 AND user_id=$2', [id, req.user.id]);
if (!check.rows.length) return res.status(404).json({ message: 'Task not found' });


await db.query('DELETE FROM tasks WHERE id=$1', [id]);
res.json({ message: 'Deleted' });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Server error' });
}
});


module.exports = router;