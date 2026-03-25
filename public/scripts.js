// 1. DEFINIR LAS VARIABLES (Esto es lo que faltaba)
const form = document.getElementById('form-usuario');
const lista = document.getElementById('lista-usuarios');

let editando = false;
let usuarioIdAEditar = null;

// 2. FUNCIÓN PARA CARGAR USUARIOS
async function cargarUsuarios() {
    try {
        const res = await fetch('/api/usuarios');
        const usuarios = await res.json();
        lista.innerHTML = '';

        usuarios.forEach(u => {
            const li = document.createElement('li');
            li.textContent = `${u.nombre} - ${u.email} `;

            // Botón Eliminar
            const btnBorrar = document.createElement('button');
            btnBorrar.textContent = 'Eliminar';
            btnBorrar.onclick = async () => {
                await fetch(`/api/usuarios/${u.id}`, { method: 'DELETE' });
                cargarUsuarios();
            };

            // Botón Editar
            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.onclick = () => {
                document.getElementById('nombre').value = u.nombre;
                document.getElementById('email').value = u.email;
                editando = true;
                usuarioIdAEditar = u.id;
                form.querySelector('button').textContent = 'Actualizar Usuario';
            };

            li.appendChild(btnEditar);
            li.appendChild(btnBorrar);
            lista.appendChild(li);
        });
    } catch (error) {
        console.error("Error conectando con el servidor:", error);
    }
}

// 3. ENVIAR FORMULARIO (POST o PUT)
form.onsubmit = async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;

    if (editando) {
        await fetch(`/api/usuarios/${usuarioIdAEditar}`, {
            method: 'PUT',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ nombre, email })
        });
        editando = false;
        usuarioIdAEditar = null;
        form.querySelector('button').textContent = 'Agregar Usuario';
    } else {
        await fetch('/api/usuarios', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ nombre, email })
        });
    }

    form.reset();
    cargarUsuarios();
}

// 4. INICIALIZAR
cargarUsuarios();