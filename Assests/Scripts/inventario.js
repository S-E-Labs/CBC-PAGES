const categorias = ["lavamanos", "muebles", "sanitarios", "grifos", "accesorios"];

function obtenerCategoria() {
  return document.getElementById("categoria").value.toLowerCase();
}

function mostrarProductos(filtrados = null) {
  const tbody = document.querySelector("#tablaProductos tbody");
  tbody.innerHTML = "";

  let productosAMostrar = [];

  if (filtrados) {
    productosAMostrar = filtrados;
  } else {
    const categoria = obtenerCategoria();
    if (categoria) {
      productosAMostrar = JSON.parse(localStorage.getItem(categoria)) || [];
      productosAMostrar = productosAMostrar.map(p => ({ ...p, categoria }));
    } else {
      // Mostrar todo inventario
      productosAMostrar = [];
      for (let cat of categorias) {
        let prods = JSON.parse(localStorage.getItem(cat)) || [];
        prods = prods.map(p => ({ ...p, categoria: cat }));
        productosAMostrar = productosAMostrar.concat(prods);
      }
    }
  }

  productosAMostrar.forEach((prod) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${prod.categoria}</td>
      <td>${prod.codigo}</td>
      <td>${prod.nombre}</td>
      <td>${prod.precio}</td>
      <td>${prod.cantidad}</td>
      <td><button onclick="eliminarProductoPorCodigo('${prod.codigo}')">🗑</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function eliminarProductoPorCodigo(codigo) {
  for (let cat of categorias) {
    let productos = JSON.parse(localStorage.getItem(cat)) || [];
    const index = productos.findIndex(p => p.codigo === codigo);
    if (index > -1) {
      productos.splice(index, 1);
      localStorage.setItem(cat, JSON.stringify(productos));
      break;
    }
  }
  filtrarProductos();
}

function agregarProducto() {
  const categoria = obtenerCategoria();
  const codigo = document.getElementById("codigo").value.trim();
  const nombre = document.getElementById("nombre").value.trim();
  const precio = parseFloat(document.getElementById("precio").value);
  const cantidad = parseInt(document.getElementById("cantidad").value);

  if (!categoria) {
    alert("Selecciona una categoría para agregar producto.");
    return;
  }
  if (!codigo || !nombre || isNaN(precio) || isNaN(cantidad)) {
    alert("Todos los campos son obligatorios y deben ser válidos.");
    return;
  }

  const productos = JSON.parse(localStorage.getItem(categoria)) || [];
  if (productos.find(p => p.codigo === codigo)) {
    alert("Ya existe un producto con ese código en esta categoría.");
    return;
  }

  productos.push({ codigo, nombre, precio, cantidad });
  localStorage.setItem(categoria, JSON.stringify(productos));

  // Limpiar inputs
  document.getElementById("codigo").value = "";
  document.getElementById("nombre").value = "";
  document.getElementById("precio").value = "";
  document.getElementById("cantidad").value = "";

  mostrarProductos();
}

function filtrarProductos() {
  const texto = document.getElementById("buscar").value.toLowerCase();

  let todosLosProductos = [];
  for (let cat of categorias) {
    let productos = JSON.parse(localStorage.getItem(cat)) || [];
    productos = productos.map(p => ({ ...p, categoria: cat }));
    todosLosProductos = todosLosProductos.concat(productos);
  }

  const filtrados = todosLosProductos.filter(p => p.nombre.toLowerCase().includes(texto));
  mostrarProductos(filtrados);
}

function exportar(tipo, todo = false) {
  let datos = [];

  if (todo) {
    for (let cat of categorias) {
      let productos = JSON.parse(localStorage.getItem(cat)) || [];
      productos.forEach(p => {
        datos.push({
          Categoría: cat,
          Código: p.codigo,
          Nombre: p.nombre,
          Precio: p.precio,
          Cantidad: p.cantidad,
        });
      });
    }
    if (datos.length === 0) return alert("No hay productos en el inventario para exportar.");
  } else {
    const categoria = obtenerCategoria();
    if (!categoria) return alert("Selecciona una categoría para exportar.");
    let productos = JSON.parse(localStorage.getItem(categoria)) || [];
    productos.forEach(p => {
      datos.push({
        Código: p.codigo,
        Nombre: p.nombre,
        Precio: p.precio,
        Cantidad: p.cantidad,
      });
    });
    if (datos.length === 0) return alert("No hay productos en esta categoría para exportar.");
  }

  if (tipo === "excel") {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datos);
    XLSX.utils.book_append_sheet(wb, ws, todo ? "Inventario Completo" : obtenerCategoria());
    XLSX.writeFile(wb, `inventario_${todo ? "completo" : obtenerCategoria()}.xlsx`);
  } else {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text(todo ? "Inventario Completo" : `Inventario: ${obtenerCategoria()}`, 14, 10);
    const head = [Object.keys(datos[0])];
    const body = datos.map(obj => Object.values(obj));

    doc.autoTable({
      head: head,
      body: body,
      startY: 20,
    });

    doc.save(`inventario_${todo ? "completo" : obtenerCategoria()}.pdf`);
  }
}

// Mostrar inventario al cargar
document.addEventListener("DOMContentLoaded", () => {
  mostrarProductos();
});
