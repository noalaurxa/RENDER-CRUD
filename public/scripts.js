const form         = document.getElementById('form-usuario');
const listaEl      = document.getElementById('lista-usuarios');
const emptyState   = document.getElementById('empty-state');
const listBadge    = document.getElementById('list-count-badge');
const formTitle    = document.getElementById('form-title');
const formBadge    = document.getElementById('form-badge');
const formCard     = document.getElementById('form-card');
const btnSubmit    = document.getElementById('btn-submit');
const btnCancelar  = document.getElementById('btn-cancelar');
const buscarInput  = document.getElementById('buscar');
const toast        = document.getElementById('toast');

let editando        = false;
let usuarioIdAEditar = null;
let todosLosUsuarios = [];
let toastTimeout    = null;

// Colores para los avatares
const avatarColors = [
  { bg: 'rgba(110,231,183,0.15)', color: '#6ee7b7' },
  { bg: 'rgba(56,189,248,0.15)',  color: '#38bdf8' },
  { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  { bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
  { bg: 'rgba(129,140,248,0.15)', color: '#818cf8' },
];

function showToast(msg, type = 'success') {
  clearTimeout(toastTimeout);
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

function getInitials(nombre) {
  return nombre.trim().split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

async function cargarUsuarios() {
  try {
    const res = await fetch('/api/usuarios');
    todosLosUsuarios = await res.json();
    filtrarYRenderizar();
  } catch (err) {
    showToast('Error de conexión', 'error');
  }
}

function filtrarYRenderizar() {
  const q = buscarInput.value.trim().toLowerCase();
  const filtrados = todosLosUsuarios.filter(u => 
    u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  );

  listaEl.innerHTML = '';
  listBadge.textContent = `${filtrados.length} usuario${filtrados.length !== 1 ? 's' : ''}`;

  if (todosLosUsuarios.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  filtrados.forEach(u => {
    const color = avatarColors[u.id % avatarColors.length];
    const card = document.createElement('div');
    card.className = 'user-card';
    card.innerHTML = `
      <div class="user-avatar" style="background:${color.bg}; color:${color.color}">
        ${getInitials(u.nombre)}
      </div>
      <div class="user-info">
        <div class="user-name">${u.nombre}</div>
        <div class="user-email">${u.email}</div>
      </div>
      <span class="user-id">#${String(u.id).padStart(3,'0')}</span>
      <div class="user-actions">
        <button class="btn-edit" onclick="iniciarEdicion(${u.id}, '${u.nombre}', '${u.email}')">Editar</button>
        <button class="btn-delete" onclick="eliminarUsuario(${u.id})">Eliminar</button>
      </div>
    `;
    listaEl.appendChild(card);
  });
}

async function eliminarUsuario(id) {
  if(!confirm('¿Eliminar este usuario?')) return;
  await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
  showToast('Usuario eliminado', 'info');
  cargarUsuarios();
}

function iniciarEdicion(id, nombre, email) {
  document.getElementById('nombre').value = nombre;
  document.getElementById('email').value = email;
  editando = true;
  usuarioIdAEditar = id;

  formTitle.textContent = 'Editar Usuario';
  formBadge.textContent = 'EDITAR';
  formBadge.className = 'form-mode-badge edit-mode';
  btnSubmit.innerHTML = '<span class="btn-icon">✓</span> Actualizar Usuario';
  btnSubmit.classList.add('edit-mode');
  btnCancelar.style.display = 'inline-flex';
  formCard.scrollIntoView({ behavior: 'smooth' });
}

function cancelarEdicion() {
  editando = false;
  usuarioIdAEditar = null;
  form.reset();
  formTitle.textContent = 'Nuevo Usuario';
  formBadge.textContent = 'CREAR';
  formBadge.className = 'form-mode-badge';
  btnSubmit.innerHTML = '<span class="btn-icon">+</span> Agregar Usuario';
  btnSubmit.classList.remove('edit-mode');
  btnCancelar.style.display = 'none';
}

form.onsubmit = async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;

  const method = editando ? 'PUT' : 'POST';
  const url = editando ? `/api/usuarios/${usuarioIdAEditar}` : '/api/usuarios';

  const res = await fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email })
  });

  if (res.ok) {
    showToast(editando ? 'Actualizado' : '¡Agregado!');
    cancelarEdicion();
    cargarUsuarios();
  }
};

btnCancelar.onclick = cancelarEdicion;
buscarInput.oninput = filtrarYRenderizar;

cargarUsuarios();