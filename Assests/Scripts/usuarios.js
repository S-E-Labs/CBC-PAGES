let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let auditoria = JSON.parse(localStorage.getItem("auditoriaUsuarios")) || [];
let editingUser = null;

window.addEventListener("load", () => {
  renderTable();
});

// Guarda usuarios en localStorage
function guardarUsuarios() {
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

// Registra eventos en la auditoría
function registrarAuditoria(accion, usuario) {
  auditoria.push({
    fecha: new Date().toLocaleString(),
    accion,
    ...usuario,
  });
  localStorage.setItem("auditoriaUsuarios", JSON.stringify(auditoria));
}

// Renderiza la tabla de usuarios
function renderTable() {
  const tbody = document.querySelector("#tabla-usuarios tbody");
  tbody.innerHTML = "";

  usuarios.forEach((usuario, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${usuario.id}</td>
      <td>${usuario.nombre}</td>
      <td>${usuario.correo}</td>
      <td>${usuario.rol}</td>
      <td class="${usuario.estado === 'Activo' ? 'estado-activo' : 'estado-inactivo'}">${usuario.estado}</td>
      <td>
        <button onclick="editUser(${index})">Editar</button>
        <button onclick="deleteUser(${index})">Eliminar</button>
        <button onclick="auditUser(${index})">Auditar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Agregar o editar usuario
document.getElementById("usuario-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const id = document.getElementById("idUsuario").value.trim();
  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();
  const rol = document.getElementById("rol").value;
  const estado = document.getElementById("estado").value;

  if (usuarios.some(u => (u.id === id || u.correo === correo) && u !== editingUser)) {
    alert("ID o correo ya registrados.");
    return;
  }

  const nuevoUsuario = { id, nombre, correo, password, rol: rol.toLowerCase(), estado };

  if (editingUser) {
    Object.assign(editingUser, nuevoUsuario);
    registrarAuditoria("editado", nuevoUsuario);
    editingUser = null;
    document.getElementById("cancel-edit").style.display = "none";
    document.querySelector("#usuario-form button[type='submit']").innerText = "Agregar Usuario";
  } else {
    usuarios.push(nuevoUsuario);
    registrarAuditoria("agregado", nuevoUsuario);
  }

  guardarUsuarios();
  renderTable();
  document.getElementById("usuario-form").reset();
});

// Editar usuario
function editUser(index) {
  const u = usuarios[index];
  document.getElementById("idUsuario").value = u.id;
  document.getElementById("nombre").value = u.nombre;
  document.getElementById("correo").value = u.correo;
  document.getElementById("password").value = u.password;
  document.getElementById("rol").value = capitalize(u.rol);
  document.getElementById("estado").value = u.estado;

  editingUser = u;
  document.getElementById("cancel-edit").style.display = "inline-block";
  document.querySelector("#usuario-form button[type='submit']").innerText = "Guardar Cambios";
}

// Eliminar usuario
function deleteUser(index) {
  if (confirm("¿Estás seguro de eliminar este usuario?")) {
    registrarAuditoria("eliminado", usuarios[index]);
    usuarios.splice(index, 1);
    guardarUsuarios();
    renderTable();
  }
}

// Cancelar edición
function cancelEdit() {
  editingUser = null;
  document.getElementById("usuario-form").reset();
  document.getElementById("cancel-edit").style.display = "none";
  document.querySelector("#usuario-form button[type='submit']").innerText = "Agregar Usuario";
}

// Buscar usuario
function searchUser() {
  const query = document.getElementById("search").value.toLowerCase();
  const filtered = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(query) ||
    u.correo.toLowerCase().includes(query)
  );
  renderFilteredTable(filtered);
}

function renderFilteredTable(filteredUsuarios) {
  const tbody = document.querySelector("#tabla-usuarios tbody");
  tbody.innerHTML = "";

  filteredUsuarios.forEach((usuario, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${usuario.id}</td>
      <td>${usuario.nombre}</td>
      <td>${usuario.correo}</td>
      <td>${usuario.rol}</td>
      <td class="${usuario.estado === 'Activo' ? 'estado-activo' : 'estado-inactivo'}">${usuario.estado}</td>
      <td>
        <button onclick="editUser(${index})">Editar</button>
        <button onclick="deleteUser(${index})">Eliminar</button>
        <button onclick="auditUser(${index})">Auditar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Mostrar auditoría individual de usuario
function auditUser(index) {
  const u = usuarios[index];
  alert(`📋 AUDITORÍA DE USUARIO:\n\nID: ${u.id}\nNombre: ${u.nombre}\nCorreo: ${u.correo}\nContraseña: ${u.password}\nRol: ${u.rol}\nEstado: ${u.estado}`);
}

// Mostrar toda la auditoría en tabla
function mostrarAuditoria() {
  const registros = JSON.parse(localStorage.getItem("auditoriaUsuarios")) || [];
  const tabla = document.querySelector("#tabla-auditoria tbody");
  tabla.innerHTML = "";

  registros.forEach(entry => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${entry.fecha}</td>
      <td>${entry.accion}</td>
      <td>${entry.id}</td>
      <td>${entry.nombre}</td>
      <td>${entry.correo}</td>
      <td>${entry.password}</td>
      <td>${entry.rol}</td>
      <td>${entry.estado}</td>
    `;
    tabla.appendChild(fila);
  });
}

// Exportar auditoría a PDF usando jsPDF
function exportarAuditoriaPDF() {
  const registros = JSON.parse(localStorage.getItem("auditoriaUsuarios")) || [];

  if (registros.length === 0) {
    alert("No hay registros de auditoría para exportar.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('landscape');

  doc.text("Historial de Auditoría de Usuarios", 14, 15);

  const columnas = [
    "Fecha", "Acción", "ID", "Nombre", "Correo", "Contraseña", "Rol", "Estado"
  ];

  const filas = registros.map(entry => [
    entry.fecha, entry.accion, entry.id, entry.nombre,
    entry.correo, entry.password, entry.rol, entry.estado
  ]);

  doc.autoTable({
    head: [columnas],
    body: filas,
    startY: 20,
    styles: { fontSize: 8 }
  });

  doc.save("auditoria_usuarios.pdf");
}

// Capitalizar primera letra
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
