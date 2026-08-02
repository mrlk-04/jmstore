// javascript document

/*
TemplateMo 599 Noir Fashion
https://templatemo.com/tm-599-noir-fashion
*/

// hero carousel
const slides = document.querySelectorAll('.carousel-slide');
const indicators = document.querySelectorAll('.indicator');
let currentSlide = 0;
let slideInterval;

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    slides[index].classList.add('active');
    indicators[index].classList.add('active');
    
    currentSlide = index;
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

function startSlideShow() {
    slideInterval = setInterval(nextSlide, 4000); 
}

function stopSlideShow() {
    clearInterval(slideInterval);
}

if (slides.length > 0) {
    startSlideShow();
    
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            stopSlideShow();
            showSlide(index);
            startSlideShow(); 
        });
    });

    const carousel = document.querySelector('.hero-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopSlideShow);
        carousel.addEventListener('mouseleave', startSlideShow);
    }
}

// mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobileNav.classList.toggle('active');
});

mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
    });
});

// navbar scroll effect and scroll spy
const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNav() {
    const scrollY = window.pageYOffset;
    const navHeight = navbar.offsetHeight;
    
    if (scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - navHeight - 10;
        const sectionId = section.getAttribute('id');
        
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + sectionId) {
                    link.classList.add('active');
                }
            });
        }
    });
    
    if (scrollY < 100) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#home') {
                link.classList.add('active');
            }
        });
    }
}

window.addEventListener('scroll', updateActiveNav);
window.addEventListener('resize', updateActiveNav); 
updateActiveNav(); 

// ==========================================
// INTEGRACIÓN CON API, CATEGORÍAS Y CARRITO
// ==========================================
const api_base = 'https://api-jmstore-bxc3ebc2ajh9hzda.canadaeast-01.azurewebsites.net/api';
let productosglobales = [];

let imagenesmodal = [];
let indiceimagenactual = 0;
let productoactualmodal = null; // guarda el producto abierto

// recuperar carrito de la memoria o iniciar vacío
let carritocompras = JSON.parse(localStorage.getItem('jm_carrito')) || [];

document.addEventListener('DOMContentLoaded', async () => {
    actualizarbadgecarrito();
    
    if(document.getElementById('categoryTabs')) {
        await cargarproductos(); // primero cargamos productos
        await cargarcategorias(); // luego categorías para que pueda dibujar de inmediato
    }
});

async function cargarcategorias() {
    try {
        const respuesta = await fetch(`${api_base}/categorias`);
        const categorias = await respuesta.json();
        
        const contenedortabs = document.getElementById('categoryTabs');
        contenedortabs.innerHTML = ''; 

        categorias.forEach((cat) => {
            const btn = document.createElement('button');
            btn.className = 'tab-btn';
            btn.textContent = cat.nombre;
            
            btn.onclick = () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                dibujarproductos(cat.id_categoria);
            };
            
            contenedortabs.appendChild(btn);
        });

        // selecciona y dibuja la primera categoría automáticamente
        if (categorias.length > 0) {
            contenedortabs.firstChild.click();
        }

    } catch (error) {
        console.error('error al cargar categorías:', error);
    }
}

async function cargarproductos() {
    try {
        const respuesta = await fetch(`${api_base}/productos`);
        productosglobales = await respuesta.json();
    } catch (error) {
        console.error('error al cargar productos:', error);
    }
}

async function dibujarproductos(idcategoriaseleccionada) {
    const grid = document.getElementById('collectionsGrid');
    grid.innerHTML = '<p style="text-align:center; width:100%;">cargando catálogo...</p>';

    const productosfiltrados = productosglobales.filter(p => p.id_categoria === idcategoriaseleccionada && p.visible === true);

    if (productosfiltrados.length === 0) {
        grid.innerHTML = '<p style="text-align:center; width:100%;">muy pronto nuevas colecciones en esta categoría.</p>';
        return;
    }

    grid.innerHTML = '';

    for (const prod of productosfiltrados) {
        let imagenes = [];
        let urlprincipal = 'https://res.cloudinary.com/dgfyop1vh/image/upload/v1784324761/logo_rj3d4u.jpg'; 

        try {
            const resimg = await fetch(`${api_base}/productoimagenes/producto/${prod.id_producto}`);
            const dataimagenes = await resimg.json();
            
            if (dataimagenes && dataimagenes.length > 0) {
                imagenes = dataimagenes.map(img => img.url_imagen || img.url);
                urlprincipal = imagenes[0];
            } else {
                imagenes = [urlprincipal];
            }
        } catch (e) {
            imagenes = [urlprincipal];
        }

        const card = document.createElement('div');
        card.className = 'collection-card';
        card.style.animation = 'fadeInUp 0.6s ease forwards';
        card.onclick = () => abrimodal(prod, imagenes);
        
        card.innerHTML = `
            <div class="collection-thumbnail">
                <img src="${urlprincipal}" alt="${prod.nombre}">
            </div>
            <div class="card-content">
                <span class="card-badge">disponible</span>
                <h3 class="card-title">${prod.nombre}</h3>
                <p class="card-price">$${prod.precio.toLocaleString('es-co')}</p>
            </div>
        `;
        grid.appendChild(card);
    }
}

// === lógica del modal de producto ===
function abrimodal(producto, imagenes) {
    const modal = document.getElementById('productomodal');
    if(!modal) return;
    
    productoactualmodal = producto; // guardamos en memoria temporal
    imagenesmodal = imagenes;
    indiceimagenactual = 0;
    actualizarimagenmodal();

    const btnprev = document.querySelector('.prev-btn');
    const btnnext = document.querySelector('.next-btn');
    
    if (imagenesmodal.length > 1) {
        btnprev.style.display = 'block';
        btnnext.style.display = 'block';
    } else {
        btnprev.style.display = 'none';
        btnnext.style.display = 'none';
    }
    
    document.getElementById('modal-titulo').textContent = producto.nombre;
    document.getElementById('modal-precio').textContent = `$${producto.precio.toLocaleString('es-co')}`;
    
    const textoprueba = "diseño exclusivo elaborado con materiales de primera calidad.";
    document.getElementById('modal-desc').textContent = (producto.descripcion && producto.descripcion !== "string") ? producto.descripcion : textoprueba;

    modal.style.display = 'flex';
}

function cambiarimagen(direccion) {
    indiceimagenactual += direccion;
    if (indiceimagenactual >= imagenesmodal.length) indiceimagenactual = 0;
    else if (indiceimagenactual < 0) indiceimagenactual = imagenesmodal.length - 1;
    actualizarimagenmodal();
}

function actualizarimagenmodal() {
    document.getElementById('modal-img').src = imagenesmodal[indiceimagenactual];
}

function cerrarmodal() {
    const modal = document.getElementById('productomodal');
    if(modal) modal.style.display = 'none';
}












// === lógica del carrito de compras ===
function agregaralcarrito() {
    if(!productoactualmodal) return;
    
    // buscamos si el producto ya existe en el carrito usando su id
    const productoexistente = carritocompras.find(p => p.id_producto === productoactualmodal.id_producto);
    
    if (productoexistente) {
        // si ya existe, solo sumamos 1 a la cantidad
        productoexistente.cantidad += 1;
    } else {
        // si es nuevo, guardamos lo básico: id, nombre, precio, cantidad 1 y su foto
        carritocompras.push({
            id_producto: productoactualmodal.id_producto,
            nombre: productoactualmodal.nombre,
            precio: productoactualmodal.precio,
            cantidad: 1,
            imagen: imagenesmodal[0] // guardamos la primera foto que se está viendo
        });
    }
    
    localStorage.setItem('jm_carrito', JSON.stringify(carritocompras));
    actualizarbadgecarrito();
    
    // efecto visual de botón agregado
    const btn = document.getElementById('btn-agregar-carrito');
    const txtoriginal = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check2"></i> ¡agregado!';
    btn.style.background = '#4CAF50';
    
    setTimeout(() => {
        btn.innerHTML = txtoriginal;
        btn.style.background = '';
        cerrarmodal();
    }, 1000);
}

function actualizarbadgecarrito() {
    const count = document.getElementById('cart-count');
    if(count) {
        // sumamos el total de unidades elegidas, no solo la cantidad de filas
        const totalunidades = carritocompras.reduce((suma, prod) => suma + prod.cantidad, 0);
        count.textContent = totalunidades;
    }
}

function abrircarrito() {
    const modal = document.getElementById('carritomodal');
    if(modal) {
        dibujarcarrito();
        modal.style.display = 'flex';
    }
}

function cerrarcarrito() {
    const modal = document.getElementById('carritomodal');
    if(modal) modal.style.display = 'none';
}

function dibujarcarrito() {
    const contenedor = document.getElementById('cart-items');
    const spanprecio = document.getElementById('cart-total-price');
    contenedor.innerHTML = '';
    
    if(carritocompras.length === 0) {
        contenedor.innerHTML = '<p style="text-align:center; color:#666; padding: 20px 0;">tu carrito está vacío</p>';
        spanprecio.textContent = '$0';
        return;
    }

    let total = 0;
    carritocompras.forEach((prod) => {
        const subtotal = prod.precio * prod.cantidad;
        total += subtotal;
        
        const item = document.createElement('div');
        item.className = 'cart-item';
        
        // aquí dibujamos el nombre, precio unitario, cantidad y subtotal (sin foto)
        item.innerHTML = `
            <h4 class="cart-item-name">${prod.nombre}</h4>
            
            <div class="cart-item-details">
                <span class="cart-item-unit">c/u: $${prod.precio.toLocaleString('es-co')}</span>
                
                <div class="qty-btn-group">
                    <button class="qty-btn" onclick="cambiarcantidad(${prod.id_producto}, -1)">-</button>
                    <span class="qty-number">${prod.cantidad}</span>
                    <button class="qty-btn" onclick="cambiarcantidad(${prod.id_producto}, 1)">+</button>
                </div>
                
                <span class="cart-item-subtotal">$${subtotal.toLocaleString('es-co')}</span>
            </div>
            
            <button class="cart-item-delete" onclick="eliminaritemcarrito(${prod.id_producto})" title="eliminar del carrito">
                <i class="bi bi-trash"></i>
            </button>
        `;
        contenedor.appendChild(item);
    });
    
    spanprecio.textContent = '$' + total.toLocaleString('es-co');
}

function cambiarcantidad(id_producto, cambio) {
    const producto = carritocompras.find(p => p.id_producto === id_producto);
    if (producto) {
        producto.cantidad += cambio;
        
        // si la cantidad llega a 0, lo eliminamos del carrito
        if (producto.cantidad <= 0) {
            eliminaritemcarrito(id_producto);
        } else {
            localStorage.setItem('jm_carrito', JSON.stringify(carritocompras));
            actualizarbadgecarrito();
            dibujarcarrito();
        }
    }
}

function eliminaritemcarrito(id_producto) {
    // filtramos para dejar todos los productos excepto el que queremos borrar
    carritocompras = carritocompras.filter(p => p.id_producto !== id_producto);
    localStorage.setItem('jm_carrito', JSON.stringify(carritocompras));
    actualizarbadgecarrito();
    dibujarcarrito();
}

function enviarpedidowhatsapp() {
    if(carritocompras.length === 0) {
        alert("no tienes productos en tu carrito aún.");
        return;
    }
    
    let mensaje = "hola jm store! quiero realizar el siguiente pedido:\n\n";
    let total = 0;
    
    carritocompras.forEach((prod) => {
        const subtotal = prod.precio * prod.cantidad;
        // ahora mostramos la cantidad x el producto en whatsapp
        mensaje += `*${prod.cantidad}x* ${prod.nombre} - $${subtotal.toLocaleString('es-co')}\n`;
        total += subtotal;
    });
    
    mensaje += `\n*total a pagar:* $${total.toLocaleString('es-co')}\n\n¿cuáles son los pasos para realizar el pago?`;
    
    const url = `https://wa.me/573238863120?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    
    carritocompras = [];
    localStorage.setItem('jm_carrito', JSON.stringify(carritocompras));
    actualizarbadgecarrito();
    cerrarcarrito();
}

// control de clics fuera de ambos modales
window.onclick = function(event) {
    const modalprod = document.getElementById('productomodal');
    const modalcart = document.getElementById('carritomodal');
    if (event.target == modalprod) modalprod.style.display = "none";
    if (event.target == modalcart) modalcart.style.display = "none";
}
// ==========================================























// ==========================================

// smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
            const navHeight = navbar.offsetHeight;
            let offsetTop;
            
            if (targetId === '#home') {
                offsetTop = 0;
            } else {
                offsetTop = target.offsetTop - navHeight;
            }
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// parallax effect on scroll
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero-content');
    if (parallax) {
        parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// contact form handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        const submitBtn = contactForm.querySelector('.form-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.style.opacity = '0.7';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.textContent = 'Message Sent! ✓';
            submitBtn.style.background = '#4CAF50';
            
            contactForm.reset();
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
                submitBtn.style.opacity = '';
                submitBtn.disabled = false;
            }, 3000);
        }, 1500);
    });
}

// form input animations
const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
formInputs.forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.style.transform = 'translateY(-2px)';
    });
    input.addEventListener('blur', () => {
        input.parentElement.style.transform = '';
    });
});

// intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.featured-container, .contact-content').forEach(el => {
    observer.observe(el);
});