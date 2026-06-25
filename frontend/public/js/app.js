const API_URL = '/api';
let currentFilter = 'todas';

document.addEventListener('DOMContentLoaded', () => {
  loadTasks();

  document.getElementById('taskForm').addEventListener('submit', handleCreateTask);

  document.querySelectorAll('.btn-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      loadTasks();
    });
  });
});

async function loadTasks() {
  const list = document.getElementById('tasksList');
  list.innerHTML = '<p class="loading">Carregando tarefas...</p>';

  try {
    const res = await fetch(`${API_URL}/tasks`);
    if (!res.ok) throw new Error('Erro ao carregar tarefas');
    let tasks = await res.json();

    if (currentFilter !== 'todas') {
      tasks = tasks.filter(t => t.status === currentFilter);
    }

    renderTasks(tasks);
  } catch (err) {
    list.innerHTML = `<p class="empty">Erro ao carregar tarefas: ${err.message}</p>`;
  }
}

function renderTasks(tasks) {
  const list = document.getElementById('tasksList');

  if (tasks.length === 0) {
    list.innerHTML = '<p class="empty">Nenhuma tarefa encontrada</p>';
    return;
  }

  list.innerHTML = tasks.map(task => `
    <div class="task-card" data-id="${task.id}">
      <div class="task-header">
        <span class="task-title ${task.status === 'concluida' ? 'completed' : ''}">
          ${escapeHtml(task.title)}
        </span>
        <span class="status-badge status-${task.status}">
          ${getStatusLabel(task.status)}
        </span>
      </div>
      ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
      <div class="task-actions">
        ${task.status !== 'concluida' ? `
          <button class="btn btn-success btn-sm" onclick="updateStatus(${task.id}, 'concluida')">
            Concluir
          </button>
        ` : ''}
        ${task.status === 'pendente' ? `
          <button class="btn btn-warning btn-sm" onclick="updateStatus(${task.id}, 'em_andamento')">
            Iniciar
          </button>
        ` : ''}
        ${task.status === 'em_andamento' ? `
          <button class="btn btn-warning btn-sm" onclick="updateStatus(${task.id}, 'pendente')">
            Pausar
          </button>
        ` : ''}
        <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">
          Excluir
        </button>
      </div>
    </div>
  `).join('');
}

async function handleCreateTask(e) {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Criando...';

  try {
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao criar tarefa');
    }

    showToast('Tarefa criada com sucesso!', 'success');
    document.getElementById('taskForm').reset();
    loadTasks();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Criar Tarefa';
  }
}

async function updateStatus(id, status) {
  try {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) throw new Error('Erro ao atualizar tarefa');

    const statusLabels = { pendente: 'Pendente', em_andamento: 'Em Andamento', concluida: 'Concluída' };
    showToast(`Tarefa atualizada para "${statusLabels[status]}"!`, 'success');
    loadTasks();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteTask(id) {
  if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

  try {
    const res = await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir tarefa');

    showToast('Tarefa excluída!', 'success');
    loadTasks();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function getStatusLabel(status) {
  const labels = {
    pendente: 'Pendente',
    em_andamento: 'Em Andamento',
    concluida: 'Concluída',
  };
  return labels[status] || status;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
