document.addEventListener('DOMContentLoaded', () => {
    // Variables para almacenar los datos de los productos
    const productos = [];

    // Función para actualizar el estado del botón "Comprar"
    function actualizarBotones() {
        document.querySelectorAll('.cantidad').forEach((input) => {
            const cantidad = parseInt(input.value, 10);
            const boton = input.parentElement.nextElementSibling;
            if (cantidad > 0) {
                boton.classList.add('enabled');
                boton.disabled = false;
            } else {
                boton.classList.remove('enabled');
                boton.disabled = true;
            }
        });
    }

    // Función para agregar productos
    function agregarProducto(nombre, cantidad) {
        const producto = productos.find(p => p.nombre === nombre);
        if (producto) {
            producto.cantidad += cantidad;
        } else {
            productos.push({ nombre, cantidad });
        }
    }

    // Event listener para los inputs de cantidad
    document.querySelectorAll('.cantidad').forEach(input => {
        input.addEventListener('input', () => {
            actualizarBotones();
        });
    });

    // Event listener para los botones "Comprar"
    document.querySelectorAll('.btn-comprar').forEach(boton => {
        boton.addEventListener('click', (e) => {
            e.preventDefault();
            const producto = boton.parentElement;
            const nombre = producto.querySelector('h4').innerText;
            const cantidad = parseInt(producto.querySelector('.cantidad').value, 10);

            if (cantidad > 0) {
                agregarProducto(nombre, cantidad);
                producto.querySelector('.cantidad').value = '0';
                actualizarBotones();
            }
        });
    });

    // Event listener para el botón "Terminar compra"
    document.querySelector('.btnterminar').addEventListener('click', (e) => {
        e.preventDefault();

        // Solicitar información del usuario
        const nombreCliente = prompt('Por favor, ingrese su nombre y apellido:');
        const telefonoCliente = prompt('Por favor, ingrese su número de teléfono:');
        const direccionCliente = prompt('Por favor, ingrese su dirección:');
        const ciudadCliente = prompt('Por favor, ingrese su ciudad:');

        // Crear el mensaje
        let mensaje = `Holaa Jm Store, ¿Qué tal? Soy ${nombreCliente}, quiero hacer una compra de:\n\n`;
        productos.forEach(p => {
            mensaje += `${p.nombre}: ${p.cantidad}\n`;
        });
        mensaje += `\nMi dirección es : ${direccionCliente}\nMi ciudad es : ${ciudadCliente}`;

        // Mostrar el mensaje en una ventana de alerta
        alert(mensaje);

        // Enviar datos a WhatsApp
        const telefono = '573215566771'; // Cambia esto al número de WhatsApp real
        const mensajeWhatsApp = encodeURIComponent(mensaje);
        const urlWhatsApp = `https://wa.me/${telefono}?text=${mensajeWhatsApp}`;
        
        window.open(urlWhatsApp, '_blank');
    });

    // Inicializar el estado de los botones
    actualizarBotones();
});
