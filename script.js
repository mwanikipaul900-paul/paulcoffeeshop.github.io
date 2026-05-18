// ============================================================================
// PAUL COFFEE SHOP - AUTOMATION SYSTEM
// Features: Cart Management, WhatsApp Integration, Online Payments
// ============================================================================

let cart = JSON.parse(localStorage.getItem('paulCoffeeCart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    initializeCart();
    setupEventListeners();
    syncCartWithUI();
    handleWhatsAppWelcome();
    setupPaymentControls();
    trackPageView();
});

function setupEventListeners() {
    document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
        btn.addEventListener('click', handleAddToCart);
    });

    document.querySelectorAll('.btn-quantity').forEach(btn => {
        btn.addEventListener('click', handleQuantityAdjustment);
    });

    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', handleQuantityInputChange);
    });

    const clearBtn = document.getElementById('clear-cart-btn');
    const whatsappBtn = document.getElementById('send-order-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const galleryCheckoutBtn = document.getElementById('gallery-checkout-btn');
    const payNowBtn = document.getElementById('pay-now-btn');
    const paymentMethod = document.getElementById('payment-method');
    const cartLink = document.querySelector('.cart-link');

    if (clearBtn) clearBtn.addEventListener('click', clearCart);
    if (whatsappBtn) whatsappBtn.addEventListener('click', sendOrderToWhatsApp);
    if (checkoutBtn) checkoutBtn.addEventListener('click', scrollToCart);
    if (galleryCheckoutBtn) galleryCheckoutBtn.addEventListener('click', scrollToCart);
    if (payNowBtn) payNowBtn.addEventListener('click', startOnlinePayment);
    if (paymentMethod) paymentMethod.addEventListener('change', handlePaymentMethodChange);
    if (cartLink) cartLink.addEventListener('click', scrollToCart);

    setupHamburgerMenu();
}

function initializeCart() {
    cart = JSON.parse(localStorage.getItem('paulCoffeeCart')) || [];
}

function handleAddToCart(e) {
    const btn = e.target.closest('.btn-add-to-cart');
    if (!btn) return;

    const itemId = btn.getAttribute('data-id');
    const itemName = btn.getAttribute('data-name');
    const itemPrice = parseFloat(btn.getAttribute('data-price'));

    const quantityInput = document.querySelector(`.quantity-input[data-id="${itemId}"]`);
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

    const existingItem = cart.find(item => item.id === itemId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: itemId,
            name: itemName,
            price: itemPrice,
            quantity: quantity
        });
    }

    saveCart();
    syncCartWithUI();
    showNotification(`✅ ${itemName} added to cart!`);

    if (quantityInput) quantityInput.value = 1;
}

function handleQuantityAdjustment(e) {
    const btn = e.target;
    const itemId = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');
    const quantityInput = document.querySelector(`.quantity-input[data-id="${itemId}"]`);
    if (!quantityInput) return;

    let currentValue = parseInt(quantityInput.value);

    if (action === 'plus') currentValue++;
    if (action === 'minus' && currentValue > 1) currentValue--;

    quantityInput.value = currentValue;
}

function handleQuantityInputChange(e) {
    const input = e.target;
    let value = parseInt(input.value);
    if (isNaN(value) || value < 1) input.value = 1;
}

function syncCartWithUI() {
    updateCartCount();
    updateCartDisplay();
    updateOrderSummary();
    updatePayButtonState();
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) cartCountElement.textContent = totalItems;
}

function updateCartDisplay() {
    const cartItemsList = document.getElementById('cart-items-list');
    if (!cartItemsList) return;

    if (cart.length === 0) {
        cartItemsList.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <a href="#menu" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        const whatsappBtn = document.getElementById('send-order-btn');
        const payNowBtn = document.getElementById('pay-now-btn');
        if (whatsappBtn) whatsappBtn.disabled = true;
        if (payNowBtn) payNowBtn.disabled = true;
        return;
    }

    cartItemsList.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="item-price">${item.price.toFixed(2)} KD</p>
            </div>
            <div class="cart-item-quantity">
                <button class="cart-qty-btn" onclick="updateCartQuantity('${item.id}', -1)">-</button>
                <input type="number" value="${item.quantity}" min="1" onchange="updateCartQuantity('${item.id}', this.value - ${item.quantity})">
                <button class="cart-qty-btn" onclick="updateCartQuantity('${item.id}', 1)">+</button>
            </div>
            <div class="cart-item-total">
                <span>${(item.price * item.quantity).toFixed(2)} KD</span>
            </div>
            <button class="btn-remove-item" onclick="removeFromCart('${item.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    const whatsappBtn = document.getElementById('send-order-btn');
    const payNowBtn = document.getElementById('pay-now-btn');
    if (whatsappBtn) whatsappBtn.disabled = false;
    if (payNowBtn) payNowBtn.disabled = false;
}

function updateOrderSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const subtotalEl = document.getElementById('subtotal');
    const totalItemsEl = document.getElementById('total-items');
    const totalPriceEl = document.getElementById('total-price');

    if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2) + ' KD';
    if (totalItemsEl) totalItemsEl.textContent = totalItems;
    if (totalPriceEl) totalPriceEl.textContent = subtotal.toFixed(2) + ' KD';
}

function updateCartQuantity(itemId, change) {
    const item = cart.find(i => i.id === String(itemId));
    if (item) {
        item.quantity = Math.max(1, item.quantity + parseInt(change));
        saveCart();
        syncCartWithUI();
    }
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== String(itemId));
    saveCart();
    syncCartWithUI();
    showNotification('✅ Item removed from cart');
}

function clearCart() {
    if (cart.length === 0) {
        showNotification('⚠️ Cart is already empty');
        return;
    }

    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCart();
        syncCartWithUI();
        showNotification('✅ Cart cleared');
    }
}

function saveCart() {
    localStorage.setItem('paulCoffeeCart', JSON.stringify(cart));
}

function handleWhatsAppWelcome() {
    const hasVisited = localStorage.getItem('paulCoffeeVisited');
    if (!hasVisited) {
        localStorage.setItem('paulCoffeeVisited', 'true');
        setTimeout(() => {
            showNotification('👋 Welcome to Paul Coffee Shop! Chat with us on WhatsApp for instant support!', 'info', 5000);
        }, 2000);
    }
}

function sendOrderToWhatsApp() {
    if (cart.length === 0) {
        showNotification('⚠️ Your cart is empty', 'warning');
        return;
    }

    const orderDetails = cart.map(item =>
        `• ${item.name} x${item.quantity} - ${(item.price * item.quantity).toFixed(2)} KD`
    ).join('\n');

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const message = encodeURIComponent(
        `🛒 *NEW ORDER FROM PAUL COFFEE SHOP WEBSITE*\n\n` +
        `📝 *Items Ordered:*\n${orderDetails}\n\n` +
        `💰 *Total: ${subtotal.toFixed(2)} KD*\n\n` +
        `✉️ Please confirm my order and let me know the delivery time.\n` +
        `Thank you! ☕`
    );

    const whatsappUrl = `https://wa.me/96598915665?text=${message}`;
    window.open(whatsappUrl, '_blank');

    setTimeout(() => {
        showNotification('✅ Order sent! Our team will contact you shortly.', 'success', 4000);
    }, 500);
}

function setupPaymentControls() {
    const paymentMethod = document.getElementById('payment-method');
    const mpesaGroup = document.getElementById('mpesa-phone-group');
    if (!paymentMethod || !mpesaGroup) return;
    mpesaGroup.style.display = paymentMethod.value === 'mpesa' ? 'block' : 'none';
}

function handlePaymentMethodChange() {
    const paymentMethod = document.getElementById('payment-method');
    const mpesaGroup = document.getElementById('mpesa-phone-group');
    if (!paymentMethod || !mpesaGroup) return;
    mpesaGroup.style.display = paymentMethod.value === 'mpesa' ? 'block' : 'none';
}

function updatePayButtonState() {
    const payNowBtn = document.getElementById('pay-now-btn');
    if (payNowBtn) payNowBtn.disabled = cart.length === 0;
}

async function startOnlinePayment() {
    if (cart.length === 0) {
        showNotification('⚠️ Your cart is empty', 'warning');
        return;
    }

    const paymentMethod = document.getElementById('payment-method');
    const mpesaPhone = document.getElementById('mpesa-phone');
    const method = paymentMethod ? paymentMethod.value : 'visa';
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const payload = {
        orderId: 'ORD-' + Date.now(),
        amount: subtotal,
        currency: 'KWD',
        method: method,
        items: cart,
        mpesaPhone: mpesaPhone ? mpesaPhone.value : null
    };

    try {
        showNotification('⏳ Preparing payment...', 'info', 2000);

        const response = await fetch('/api/create-payment-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success && data.paymentUrl) {
            window.location.href = data.paymentUrl;
        } else {
            showNotification('❌ Payment could not be started', 'error', 4000);
        }
    } catch (error) {
        console.error(error);
        showNotification('❌ Network error while starting payment', 'error', 4000);
    }
}

function initImageUpload() {
    const dropZones = document.querySelectorAll('[data-upload-zone]');

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleImageDrop);

        const input = zone.querySelector('input[type="file"]');
        if (input) {
            input.addEventListener('change', handleFileInput);
            zone.addEventListener('click', () => input.click());
        }
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleImageDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    handleImageFiles(files, e.currentTarget);
}

function handleFileInput(e) {
    const files = e.target.files;
    const zone = e.currentTarget.closest('[data-upload-zone]');
    handleImageFiles(files, zone);
}

function handleImageFiles(files, zone) {
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
            showNotification('❌ Please upload image files only', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showNotification('❌ Image size must be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            displayUploadedImage(e.target.result, file.name, zone);
            saveImageToStorage(e.target.result, file.name);
            showNotification('✅ Image uploaded successfully!', 'success');
        };
        reader.readAsDataURL(file);
    });
}

function displayUploadedImage(src, filename, zone) {
    const previewContainer = zone.querySelector('.image-preview') || createPreviewContainer(zone);
    const imageElement = document.createElement('div');
    imageElement.className = 'uploaded-image';
    imageElement.innerHTML = `
        <img src="${src}" alt="${filename}">
        <div class="image-actions">
            <button class="btn-remove-image" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    previewContainer.appendChild(imageElement);
}

function createPreviewContainer(zone) {
    const container = document.createElement('div');
    container.className = 'image-preview';
    zone.appendChild(container);
    return container;
}

function saveImageToStorage(imageData, filename) {
    try {
        const images = JSON.parse(localStorage.getItem('paulCoffeeImages')) || [];
        images.push({
            data: imageData,
            filename: filename,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('paulCoffeeImages', JSON.stringify(images));
    } catch (error) {
        console.error('Error saving image:', error);
        showNotification('⚠️ Could not save image locally', 'warning');
    }
}

function getUploadedImages() {
    try {
        return JSON.parse(localStorage.getItem('paulCoffeeImages')) || [];
    } catch (error) {
        console.error('Error retrieving images:', error);
        return [];
    }
}

function clearUploadedImages() {
    if (confirm('Delete all uploaded images?')) {
        localStorage.removeItem('paulCoffeeImages');
        document.querySelectorAll('.uploaded-image').forEach(img => img.remove());
        showNotification('✅ Images cleared', 'success');
    }
}

function showNotification(message, type = 'info', duration = 3000) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast-notification show ${type}`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

function scrollToCart() {
    const cartSection = document.getElementById('cart');
    if (cartSection) cartSection.scrollIntoView({ behavior: 'smooth' });
}

function setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
}

function trackPageView() {
    const pageView = {
        page: window.location.pathname,
        timestamp: new Date().toISOString(),
        referrer: document.referrer
    };

    const views = JSON.parse(localStorage.getItem('paulCoffeePageViews')) || [];
    views.push(pageView);
    localStorage.setItem('paulCoffeePageViews', JSON.stringify(views));
}

function trackCartAbandonment() {
    if (cart.length > 0) {
        const abandonment = {
            items: cart.length,
            value: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            timestamp: new Date().toISOString()
        };

        const abandonments = JSON.parse(localStorage.getItem('paulCoffeeAbandonments')) || [];
        abandonments.push(abandonment);
        localStorage.setItem('paulCoffeeAbandonments', JSON.stringify(abandonments));
    }
}

function logCartEvent(eventName, eventData = {}) {
    const event = {
        name: eventName,
        timestamp: new Date().toISOString(),
        data: eventData
    };

    const events = JSON.parse(localStorage.getItem('paulCoffeeEvents')) || [];
    events.push(event);
    localStorage.setItem('paulCoffeeEvents', JSON.stringify(events));
}

window.addEventListener('beforeunload', trackCartAbandonment);

function getCartAnalytics() {
    return {
        currentCart: cart,
        totalSpent: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        totalItems: cart.reduce((sum, item) => sum + item.quantity, 0),
        abandonedOrders: JSON.parse(localStorage.getItem('paulCoffeeAbandonments')) || [],
        uploadedImages: getUploadedImages(),
        pageViews: JSON.parse(localStorage.getItem('paulCoffeePageViews')) || []
    };
}

function clearAllData() {
    if (confirm('This will clear all stored data. Are you sure?')) {
        localStorage.clear();
        cart = [];
        location.reload();
    }
}

console.log('%c✨ Paul Coffee Shop Automation Ready!', 'font-size: 16px; color: #8B4513; font-weight: bold;');
console.log('%cAvailable Commands:', 'font-size: 12px; color: #555;');
console.log('- getCartAnalytics() - View all stored data');
console.log('- clearAllData() - Clear all stored data');
console.log('- sendOrderToWhatsApp() - Send current cart to WhatsApp');
console.log('- initImageUpload() - Initialize image upload system');
