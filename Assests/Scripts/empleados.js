document.addEventListener("DOMContentLoaded", () => {
    const acciones = document.querySelector(".inventory-actions");
    const botonesModificar = acciones.querySelectorAll("input, select, button");

    // Simulamos que el rol es "empleado"
    const rolUsuario = "empleado"; // Esto normalmente se valida desde PHP con sesiones

    if (rolUsuario === "empleado") {
        // Deshabilitar campos para edición
        botonesModificar.forEach(elem => {
            elem.disabled = true;
        });

        // Crear y mostrar mensaje de solo lectura
        const msg = document.createElement("p");
        msg.textContent = "🔒 Modo solo lectura activado. No puede modificar los elementos.";
        msg.style.color = "red"; // Puedes darle el estilo que prefieras
        msg.style.fontWeight = "bold";
        msg.style.textAlign = "center";
        
        // Añadir el mensaje en el contenedor adecuado
        acciones.appendChild(msg);
    }
});
