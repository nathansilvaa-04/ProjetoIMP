const API_URL = '/api';
let currentFilter = 'todas';
let deleteTargetId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadTasks();

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      currentFilter = item.dataset.filter;
      loadTasks();
    });
  });

  document.getElementById('btnNewTask').addEventListener('click', () => openModal());
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('btnCancel').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.getElementById('taskForm').addEventListener('submit', handleCreateTask);

  document.getElementById('confirmNo').addEventListener('click', closeConfirm);
  document.getElementById('confirmOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeConfirm();
  });
  document.getElementById('confirmYes').addEventListener('click', () => {
    if (deleteTargetId !== null) {
      executeDelete(deleteTargetId);
      deleteTargetId = null;
    }
    closeConfirm();
  });
});

function openModal(task = null) {
  const overlay = document.getElementById('modalOverlay');
  const title = document.getElementById('modalTitle');
  const submit = document.getElementById('btnSubmit');
  const form = document.getElementById('taskForm');

  form.reset();
  form.dataset.editId = '';

  if (task) {
    title.textContent = 'Editar Tarefa';
    submit.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 14.66V20a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h5.34"/><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/></svg> Salvar';
    document.getElementById('title').value = task.title;
    document.getElementById('description').value = task.description || '';
    form.dataset.editId = task.id;
  } else {
    title.textContent = 'Nova Tarefa';
    submit.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Criar Tarefa';
  }

  overlay.classList.add('open');
  document.getElementById('title').focus();
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

function closeConfirm() {
  document.getElementById('confirmOverlay').classList.remove('open');
}

let allTasks = [];

async function loadTasks() {
  const list = document.getElementById('tasksList');
  const skeleton = document.getElementById('loadingSkeleton');
  skeleton.classList.remove('hidden');
  list.innerHTML = '';

  try {
    const res = await fetch(`${API_URL}/tasks`);
    if (!res.ok) throw new Error('Erro ao carregar');
    allTasks = await res.json();

    updateStats(allTasks);
    updateNavCounts(allTasks);

    const filtered = currentFilter === 'todas'
      ? allTasks
      : allTasks.filter(t => t.status === currentFilter);

    renderTasks(filtered);
  } catch (err) {
    list.innerHTML = `<div class="empty-state"><h3>Erro ao carregar</h3><p>${err.message}</p></div>`;
  } finally {
    skeleton.classList.add('hidden');
  }
}

function updateStats(tasks) {
  const pendentes = tasks.filter(t => t.status === 'pendente');
  const andamento = tasks.filter(t => t.status === 'em_andamento');
  const concluidas = tasks.filter(t => t.status === 'concluida');

  document.getElementById('statTotal').textContent = tasks.length;
  document.getElementById('statPendentes').textContent = pendentes.length;
  document.getElementById('statAndamento').textContent = andamento.length;
  document.getElementById('statConcluidas').textContent = concluidas.length;
}

function updateNavCounts(tasks) {
  document.getElementById('countTodas').textContent = tasks.length;
  document.getElementById('countPendente').textContent = tasks.filter(t => t.status === 'pendente').length;
  document.getElementById('countAndamento').textContent = tasks.filter(t => t.status === 'em_andamento').length;
  document.getElementById('countConcluida').textContent = tasks.filter(t => t.status === 'concluida').length;
}

function renderTasks(tasks) {
  const list = document.getElementById('tasksList');

  if (tasks.length === 0) {
    const messages = {
      todas: { title: 'Nenhuma tarefa ainda', desc: 'Crie sua primeira tarefa!' },
      pendente: { title: 'Nenhuma tarefa pendente', desc: 'Todas as tarefas estão em andamento ou concluídas.' },
      em_andamento: { title: 'Nenhuma tarefa em andamento', desc: 'Inicie uma tarefa pendente.' },
      concluida: { title: 'Nenhuma tarefa concluída', desc: 'Finalize alguma tarefa para vê-la aqui.' },
    };
    const msg = messages[currentFilter] || messages.todas;
    list.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
        </svg>
        <h3>${msg.title}</h3>
        <p>${msg.desc}</p>
      </div>`;
    return;
  }

  list.innerHTML = tasks.map(task => `
    <div class="task-card ${task.status === 'concluida' ? 'concluida' : ''}" style="animation-delay: ${Math.random() * 0.1}s">
      <div class="task-top">
        <div class="task-info">
          <div class="task-title ${task.status === 'concluida' ? 'completed' : ''}">${escapeHtml(task.title)}</div>
          ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
        </div>
        <span class="status-badge status-${task.status}">${getStatusLabel(task.status)}</span>
      </div>
      <div class="task-actions">
        ${task.status !== 'concluida' ? `
          <button class="btn btn-success btn-sm" onclick="updateStatus(${task.id}, 'concluida')">Concluir</button>
        ` : ''}
        ${task.status === 'pendente' ? `
          <button class="btn btn-warning btn-sm" onclick="updateStatus(${task.id}, 'em_andamento')">Iniciar</button>
        ` : ''}
        ${task.status === 'em_andamento' ? `
          <button class="btn btn-warning btn-sm" onclick="updateStatus(${task.id}, 'pendente')">Pausar</button>
        ` : ''}
        <button class="btn btn-danger btn-sm" onclick="confirmDelete(${task.id})">Excluir</button>
      </div>
    </div>
  `).join('');
}

async function handleCreateTask(e) {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const editId = e.target.dataset.editId;
  const btn = document.getElementById('btnSubmit');
  btn.disabled = true;

  try {
    if (editId) {
      const res = await fetch(`${API_URL}/tasks/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar');
      showToast('Tarefa atualizada!', 'success');
    } else {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao criar');
      }
      showToast('Tarefa criada!', 'success');
    }

    closeModal();
    loadTasks();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

async function updateStatus(id, status) {
  const card = document.querySelector(`.task-card[data-id="${id}"]`);
  try {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Erro ao atualizar');

    const labels = { pendente: 'Pendente', em_andamento: 'Em Andamento', concluida: 'Concluída' };
    showToast(`Tarefa movida para "${labels[status]}"`, 'success');
    loadTasks();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function confirmDelete(id) {
  deleteTargetId = id;
  document.getElementById('confirmOverlay').classList.add('open');
}

async function executeDelete(id) {
  try {
    const res = await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir');
    showToast('Tarefa excluída!', 'success');
    loadTasks();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function getStatusLabel(status) {
  return { pendente: 'Pendente', em_andamento: 'Em Andamento', concluida: 'Concluída' }[status] || status;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  };

  toast.innerHTML = icons[type] || '';
  toast.appendChild(document.createTextNode(message));
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
