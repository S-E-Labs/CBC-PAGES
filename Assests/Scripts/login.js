let intentosFallidos = 0;

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const tipoUsuario = document.getElementById("tipoUsuario").value.toLowerCase();
  const correoIngresado = document.getElementById("nombreUsuario").value.trim().toLowerCase();
  const contrasenaIngresada = document.getElementById("contrasena").value;

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const usuarioEncontrado = usuarios.find(
    u =>
      u.correo.toLowerCase() === correoIngresado &&
      u.password === contrasenaIngresada &&
      u.estado.toLowerCase() === "activo" &&
      u.rol.toLowerCase() === tipoUsuario
  );

  if (usuarioEncontrado) {
    // Guardar datos en sessionStorage
    sessionStorage.setItem("usuario", usuarioEncontrado.nombre);
    sessionStorage.setItem("rol", usuarioEncontrado.rol);
    sessionStorage.setItem("correo", usuarioEncontrado.correo);

    alert(`Bienvenido, ${usuarioEncontrado.nombre}`);

    if (tipoUsuario === "administrador") {
      window.location.href = ".././Pages/Admin/admin.html";
    } else if (tipoUsuario === "empleado") {
      window.location.href = "../Pages/Empleados/empleados.html";
    }
  } else {
    intentosFallidos++;
    alert(`❌ Credenciales incorrectas. Intento ${intentosFallidos}/3`);

    if (intentosFallidos >= 3) {
      capturarIntruso(correoIngresado); // Captura oculta al superar los intentos
    }
  }
});

// Captura oculta de imagen al fallar 3 veces
function capturarIntruso(correoIntentado) {
  const video = document.createElement("video");
  const canvas = document.createElement("canvas");

  video.setAttribute("autoplay", "");
  video.style.display = "none";
  canvas.style.display = "none";

  document.body.appendChild(video);
  document.body.appendChild(canvas);

  navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream;

    setTimeout(() => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      const dataURL = canvas.toDataURL("image/png");

      // Detener cámara
      stream.getTracks().forEach(track => track.stop());

      // Guardar auditoría
      registrarIntentoSospechoso(correoIntentado, dataURL);

      // Eliminar nodos
      video.remove();
      canvas.remove();

      alert("❌ Demasiados intentos. Acceso bloqueado temporalmente.");
    }, 3000);
  }).catch(err => {
    console.warn("No se pudo acceder a la cámara:", err);
  });
}

// Registro del intento fallido con imagen en localStorage
function registrarIntentoSospechoso(correo, imagenData) {
  const registro = {
    fecha: new Date().toLocaleString(),
    correoIntentado: correo,
    tipo: "Intento sospechoso",
    imagen: imagenData
  };

  const intentos = JSON.parse(localStorage.getItem("auditoriaIntrusos")) || [];
  intentos.push(registro);
  localStorage.setItem("auditoriaIntrusos", JSON.stringify(intentos));
}
