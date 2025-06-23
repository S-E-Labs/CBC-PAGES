function irLogin() {
  try {
    window.location.href = "/proyecto_final/Pages/index.html";
  } catch (error) {
    alert("No se pudo redirigir a la página de inicio de sesión.");
    console.error(error);
  }
}
