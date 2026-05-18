// Hamburger Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Close menu when a link is clicked
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// Animate Menu Items on Scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'slideUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const menuItems = document.querySelectorAll('.menu-item');
menuItems.forEach((item, index) => {
    item.style.animationDelay = (index * 0.1) + 's';
    observer.observe(item);
});

// Animate Stats
const statElements = document.querySelectorAll('.stat');
statElements.forEach((stat, index) => {
    stat.style.animationDelay = (index * 0.2) + 's';
    observer.observe(stat);
});

// Active Navigation Link
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + sectionId) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// WhatsApp Message Formatting
const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
whatsappLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
    });
    link.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

// Page Load Animation
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
    loadCartFromStorage();
});

// Prevent Default Scrolling for Smooth Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
        }
    });
});

// ========== SHOPPING CART FUNCTIONALITY ==========

let cart = [];

// Load cart from localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('paulCoffeeCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartUI();
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('paulCoffeeCart', JSON.stringify(cart));
}

// Add item to cart
function addToCart(itemId, itemName, itemPrice) {
    const existingItem = cart.find(item => item.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: itemId,
            name: itemName,
            price: parseFloat(itemPrice),
            quantity: 1
        });
    }
    
    saveCartToStorage();
    updateCartUI();
    showAddedFeedback(itemId);
}

// Show "Added!" feedback on button
function showAddedFeedback(itemId) {
    const buttons = document.querySelectorAll(`[data-id="${itemId}"]`);
    buttons.forEach(btn => {
        if (btn.classList.contains('btn-add-to-cart')) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Added!';
            btn.classList.add('added');
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('added');
            }, 1500);
        }
    });
}

// Remove item from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCartToStorage();
    updateCartUI();
}

// Update item quantity
function updateQuantity(itemId, quantity) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
        if (quantity > 0) {
            item.quantity = quantity;
        } else {
            removeFromCart(itemId);
        }
    }
    saveCartToStorage();
    updateCartUI();
}

// Clear entire cart
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCartToStorage();
        updateCartUI();
    }
}

// Update cart UI
function updateCartUI() {
    // Update cart count in navbar
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items list
    const cartItemsList = document.getElementById('cart-items-list');
    
    if (cart.length === 0) {
        cartItemsList.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <a href="#menu" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
    } else {
        cartItemsList.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>${item.price.toFixed(2)} KD each</p>
                    <p class="item-total"><strong>Total: ${(item.price * item.quantity).toFixed(2)} KD</strong></p>
                </div>
                <div class="cart-item-quantity">
                    <button class="qty-btn minus-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
                    <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
                    <button class="qty-btn plus-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        `).join('');
    }

    // Update cart summary
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    document.getElementById('subtotal').textContent = subtotal.toFixed(2) + ' KD';
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('total-price').textContent = subtotal.toFixed(2) + ' KD';

    // Enable/disable send order button
    const sendOrderBtn = document.getElementById('send-order-btn');
    sendOrderBtn.disabled = cart.length === 0;
}

// Send order to WhatsApp
function sendOrderToWhatsApp() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    let message = '🛍️ *Order from Paul Coffee Shop*\n\n';
    message += '*Order Details:*\n';
    message += '━━━━━━━━━━━━━━━━━━━━\n';

    cart.forEach(item => {
        message += `\n📌 ${item.name}\n`;
        message += `   Qty: ${item.quantity}\n`;
        message += `   Price: ${item.price.toFixed(2)} KD each\n`;
        message += `   Subtotal: ${(item.price * item.quantity).toFixed(2)} KD\n`;
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    message += '\n━━━━━━━━━━━━━━━━━━━━\n';
    message += `\n*Total Items:* ${totalItems}\n`;
    message += `*Total Amount:* ${total.toFixed(2)} KD\n`;
    message += `\n✅ Please confirm this order and let me know the delivery details.\n`;
    message += `\nThank you for ordering from Paul Coffee Shop! ☕`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/96598915665?text=${encodedMessage}`;
    
    window.open(whatsappURL, '_blank');
}

// Add event listeners to "Add to Cart" buttons
document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-add-to-cart')) {
        const button = e.target.closest('.btn-add-to-cart');
        const itemId = button.dataset.id;
        const item = button.closest('[data-id]');
        const itemName = item.dataset.name;
        const itemPrice = item.dataset.price;
        
        addToCart(parseInt(itemId), itemName, itemPrice);
    }
});

// Send order button
const sendOrderBtn = document.getElementById('send-order-btn');
if (sendOrderBtn) {
    sendOrderBtn.addEventListener('click', sendOrderToWhatsApp);
}

// Clear cart button
const clearCartBtn = document.getElementById('clear-cart-btn');
if (clearCartBtn) {
    clearCartBtn.addEventListener('click', clearCart);
}

// Checkout buttons
const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        document.querySelector('#cart').scrollIntoView({ behavior: 'smooth' });
    });
}

const galleryCheckoutBtn = document.getElementById('gallery-checkout-btn');
if (galleryCheckoutBtn) {
    galleryCheckoutBtn.addEventListener('click', () => {
        document.querySelector('#cart').scrollIntoView({ behavior: 'smooth' });
    });
}
