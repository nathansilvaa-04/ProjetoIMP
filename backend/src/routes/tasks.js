const express = require('express');
const router = express.Router();
const { getPool } = require('../database');
const { publishTaskNotification } = require('../services/notificationService');
const { tasksCreatedTotal, tasksCompletedTotal } = require('../metrics');

router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }

    const pool = getPool();
    const [result] = await pool.execute(
      'INSERT INTO tasks (title, description) VALUES (?, ?)',
      [title, description || '']
    );

    const [rows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    const task = rows[0];

    tasksCreatedTotal.inc();

    await publishTaskNotification('task_created', task);

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const pool = getPool();

    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    params.push(id);
    await pool.execute(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, params);

    const [rows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    const task = rows[0];

    if (status === 'concluida') {
      tasksCompletedTotal.inc();
    }

    await publishTaskNotification('task_updated', task);

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [rows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ message: 'Tarefa removida' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
