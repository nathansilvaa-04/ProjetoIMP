const express = require('express');
const router = express.Router();
const { getPool } = require('../database');
const { publishTaskNotification } = require('../services/notificationService');
const { tasksCreatedTotal, tasksCompletedTotal, tasksDeletedTotal, tasksUpdatedTotal, tasksActiveGauge, tasksByStatusGauge, dbQueryDuration } = require('../metrics');

async function refreshStatusGauges(pool) {
  const end = dbQueryDuration.startTimer({ operation: 'status_count' });
  const [rows] = await pool.execute(
    "SELECT status, COUNT(*) as count FROM tasks GROUP BY status"
  );
  end();
  const statuses = ['pendente', 'em_andamento', 'concluida'];
  const map = {};
  rows.forEach(r => { map[r.status] = Number(r.count); });
  statuses.forEach(s => tasksByStatusGauge.set({ status: s }, map[s] || 0));
  const active = (map['pendente'] || 0) + (map['em_andamento'] || 0);
  tasksActiveGauge.set(active);
}

router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const end = dbQueryDuration.startTimer({ operation: 'select_all' });
    const [rows] = await pool.execute('SELECT * FROM tasks ORDER BY created_at DESC');
    end();
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
    const endInsert = dbQueryDuration.startTimer({ operation: 'insert' });
    const [result] = await pool.execute(
      'INSERT INTO tasks (title, description) VALUES (?, ?)',
      [title, description || '']
    );
    endInsert();

    const [rows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    const task = rows[0];

    tasksCreatedTotal.inc();
    await refreshStatusGauges(pool);

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
    const endUpd = dbQueryDuration.startTimer({ operation: 'update' });
    await pool.execute(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, params);
    endUpd();

    const [rows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    const task = rows[0];

    tasksUpdatedTotal.inc();
    if (status === 'concluida') {
      tasksCompletedTotal.inc();
    }
    await refreshStatusGauges(pool);

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
    tasksDeletedTotal.inc();
    await refreshStatusGauges(pool);
    res.json({ message: 'Tarefa removida' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
