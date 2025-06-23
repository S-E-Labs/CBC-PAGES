const formulario = document.getElementById("formulario-proveedor");
const tabla = document.getElementById("tabla-proveedores");
let proveedores = [];

formulario.addEventListener("submit", function (e) {
  e.preventDefault();

  const proveedor = {
    id: document.getElementById("id").value.trim(),
    empresa: document.getElementById("empresa").value.trim(),
    contacto: document.getElementById("contacto").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    cuenta: document.getElementById("cuenta").value.trim()
  };

  proveedores.push(proveedor);
  formulario.reset();
  mostrarProveedores();
});

function mostrarProveedores() {
  tabla.innerHTML = "";
  proveedores.forEach((prov, index) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td><input value="${prov.id}" onchange="editarProveedor(${index}, 'id', this.value)" /></td>
      <td><input value="${prov.empresa}" onchange="editarProveedor(${index}, 'empresa', this.value)" /></td>
      <td><input value="${prov.contacto}" onchange="editarProveedor(${index}, 'contacto', this.value)" /></td>
      <td><input value="${prov.telefono}" onchange="editarProveedor(${index}, 'telefono', this.value)" /></td>
      <td><input value="${prov.cuenta}" onchange="editarProveedor(${index}, 'cuenta', this.value)" /></td>
      <td class="acciones">
        <button onclick="eliminarProveedor(${index})" class="eliminar">Eliminar</button>
      </td>
    `;

    tabla.appendChild(fila);
  });
}

function editarProveedor(index, campo, valor) {
  proveedores[index][campo] = valor.trim();
}

function eliminarProveedor(index) {
  if (confirm("¿Estás seguro de eliminar este proveedor?")) {
    proveedores.splice(index, 1);
    mostrarProveedores();
  }
}

function exportarExcel() {
  const data = proveedores.length > 0
    ? proveedores.map(p => ({
        ID: p.id,
        Empresa: p.empresa,
        Contacto: p.contacto,
        Teléfono: p.telefono,
        Cuenta: p.cuenta
      }))
    : [{ ID: "", Empresa: "", Contacto: "", Teléfono: "", Cuenta: "" }];

  const hoja = XLSX.utils.json_to_sheet(data);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Proveedores");

  XLSX.writeFile(libro, "Proveedores_CBC.xlsx");
  alert("📁 Archivo Excel exportado correctamente.");
}
