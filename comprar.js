document.addEventListener('DOMContentLoaded', () => {
    const productos = [];

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

    function agregarProducto(nombre, cantidad) {
        const producto = productos.find(p => p.nombre === nombre);
        if (producto) {
            producto.cantidad += cantidad;
        } else {
            productos.push({ nombre, cantidad });
        }
    }

    function mostrarCarrito() {
        let mensaje = `Tu carrito de compras contiene:\n\n`;
        productos.forEach(p => {
            mensaje += `- ${p.nombre}: ${p.cantidad}\n`;
        });

        alert(mensaje);
    }

    document.querySelectorAll('.btn-mas').forEach(boton => {
        boton.addEventListener('click', () => {
            const input = boton.previousElementSibling;
            input.value = parseInt(input.value, 10) + 1;
            actualizarBotones();
        });
    });

    document.querySelectorAll('.btn-menos').forEach(boton => {
        boton.addEventListener('click', () => {
            const input = boton.nextElementSibling;
            const cantidadActual = parseInt(input.value, 10);
            if (cantidadActual > 0) {
                input.value = cantidadActual - 1;
            }
            actualizarBotones();
        });
    });

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
                
                // Mostrar el carrito después de agregar el producto
                mostrarCarrito();
            }
        });
    });

    document.querySelector('.btnterminar').addEventListener('click', (e) => {
        e.preventDefault();

        const datosCliente = prompt('Por favor, ingrese su (nombre y apellido, ciudad y dirección), separados por comas: ');
        const [nombreCliente, ciudadCliente, direccionCliente] = datosCliente.split(',').map(dato => dato.trim());

        let mensaje = `Holaa, ¿Qué tal? Soy ${nombreCliente}, quiero hacer una compra de:\n\n`;
        productos.forEach(p => {
            mensaje += `- ${p.nombre}: ${p.cantidad}\n`;
        });

        mensaje += `\nMis datos de envío son:\nCiudad: ${ciudadCliente}\nDirección: ${direccionCliente}`;

        window.open(`https://wa.me/573147012339?text=${encodeURIComponent(mensaje)}`, '_blank');
    });

    document.querySelector('.menu-toggle').addEventListener('click', () => {
        document.querySelector('nav ul').classList.toggle('active');
    });

    actualizarBotones();
});
