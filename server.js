const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
// Servir archivos estáticos (HTML, CSS, JS) desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Base de datos temporal en memoria (se borra al reiniciar el servidor)
let usuarios = [];
let contador = 1;

// --- ENDPOINTS API ---

// 1. Obtener todos los usuarios (READ)
app.get('/api/usuarios', (req, res) => {
    res.json(usuarios);
});

// 2. Crear un usuario (CREATE)
app.post('/api/usuarios', (req, res) => {
    const { nombre, email } = req.body;
    
    if (!nombre || !email) {
        return res.status(400).json({ mensaje: 'Nombre y email son obligatorios' });
    }

    const nuevoUsuario = { id: contador++, nombre, email };
    usuarios.push(nuevoUsuario);
    res.status(201).json(nuevoUsuario);
});

// 3. Editar un usuario (UPDATE)
app.put('/api/usuarios/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { nombre, email } = req.body;
    
    const usuario = usuarios.find(u => u.id === id);

    if (usuario) {
        usuario.nombre = nombre || usuario.nombre;
        usuario.email = email || usuario.email;
        res.json(usuario);
    } else {
        res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
});

// 4. Eliminar un usuario (DELETE)
app.delete('/api/usuarios/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const existe = usuarios.some(u => u.id === id);

    if (existe) {
        usuarios = usuarios.filter(u => u.id !== id);
        res.json({ mensaje: 'Usuario eliminado' });
    } else {
        res.status(404).json({ mensaje: 'El usuario no existe' });
    }
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor funcionando en: http://localhost:${PORT}`);
});