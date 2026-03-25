const express = require('express');
const path    = require('path');
const app     = express();

// ── Middleware ────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Base de datos en memoria ──────────────────────────────
let usuarios = [];
let contador = 1;

// ── Validación básica ─────────────────────────────────────
function validarUsuario(nombre, email) {
  const errores = [];
  if (!nombre || nombre.trim().length < 2) errores.push('El nombre debe tener al menos 2 caracteres.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errores.push('El email no tiene un formato válido.');
  return errores;
}

// ── ENDPOINTS ─────────────────────────────────────────────

// GET /api/usuarios — Listar todos
app.get('/api/usuarios', (req, res) => {
  res.json(usuarios);
});

// GET /api/usuarios/:id — Obtener uno
app.get('/api/usuarios/:id', (req, res) => {
  const id      = parseInt(req.params.id);
  const usuario = usuarios.find(u => u.id === id);
  if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
  res.json(usuario);
});

// POST /api/usuarios — Crear
app.post('/api/usuarios', (req, res) => {
  const { nombre, email } = req.body;
  const errores = validarUsuario(nombre, email);
  if (errores.length) return res.status(400).json({ errores });

  // Email único
  if (usuarios.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ errores: ['Ya existe un usuario con ese correo.'] });
  }

  const nuevoUsuario = {
    id: contador++,
    nombre: nombre.trim(),
    email:  email.trim().toLowerCase(),
    creadoEn: new Date().toISOString()
  };
  usuarios.push(nuevoUsuario);
  res.status(201).json(nuevoUsuario);
});

// PUT /api/usuarios/:id — Actualizar
app.put('/api/usuarios/:id', (req, res) => {
  const id      = parseInt(req.params.id);
  const usuario = usuarios.find(u => u.id === id);
  if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

  const { nombre, email } = req.body;
  const errores = validarUsuario(
    nombre ?? usuario.nombre,
    email  ?? usuario.email
  );
  if (errores.length) return res.status(400).json({ errores });

  // Email único (excluyendo el mismo usuario)
  if (email && usuarios.some(u => u.id !== id && u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ errores: ['Ese correo ya está en uso por otro usuario.'] });
  }

  if (nombre) usuario.nombre = nombre.trim();
  if (email)  usuario.email  = email.trim().toLowerCase();
  usuario.actualizadoEn = new Date().toISOString();

  res.json(usuario);
});

// DELETE /api/usuarios/:id — Eliminar
app.delete('/api/usuarios/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = usuarios.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

  const eliminado = usuarios.splice(idx, 1)[0];
  res.json({ mensaje: 'Usuario eliminado', usuario: eliminado });
});

// GET /api/stats — Estadísticas básicas
app.get('/api/stats', (req, res) => {
  res.json({
    total: usuarios.length,
    ultimoId: contador - 1
  });
});

// ── Fallback ──────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ mensaje: 'Ruta no encontrada' }));

// ── Servidor ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅  UserVault corriendo en: http://localhost:${PORT}`);
});