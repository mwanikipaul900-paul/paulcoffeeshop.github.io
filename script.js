let cart = JSON.parse(localStorage.getItem('paulCoffeeCart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    syncCartWithUI();
    handleWhatsAppWelcome();
    setupPaymentControls();
    setupGlobalEvents();
}

function setupGlobalEvents() {
    document.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.btn-add-to-cart');
        const qtyBtn = e.target.closest('.btn-quantity');
        const cartQtyBtn = e.target.closest('.cart-qty-btn');
        const removeBtn = e.target.closest('.btn-remove-item');
        const clearBtn = e.target.closest('#clear-cart-btn');
        const whatsappBtn = e.target.closest('#send-order-btn');
        const payNowBtn = e.target.closest('#pay-now-btn');
        const cartLink = e.target.closest('.cart-link');

        if (addBtn) { e.preventDefault(); handleAddToCart(addBtn); return; }
        if (qtyBtn) { e.preventDefault(); handleQuantityAdjustment(qtyBtn); return; }
        if (cartQtyBtn) { e.preventDefault(); handleCartQuantityButton(cartQtyBtn); return; }
        if (removeBtn) { e.preventDefault(); handleRemoveCartItem(removeBtn); return; }
        if (clearBtn) { e.preventDefault(); clearCart(); return; }
        if (whatsappBtn) { e.preventDefault(); sendOrderToWhatsApp(); return; }
        if (payNowBtn) { e.preventDefault(); startOnlinePayment(); return; }
        if (cartLink) { e.preventDefault(); scrollToCart(); return; }
    });

    document.addEventListener('change', (e) => {
        if (e.target.matches('.quantity-input')) handleQuantityInputChange(e.target);
        if (e.target.matches('#payment-method')) setupPaymentControls();
        if (e.target.matches('#mpesa-phone')) localStorage.setItem('paulCoffeeMpesaPhone', e.target.value || '');
    });

    setupHamburgerMenu();
}

function handleAddToCart(btn) {
    const itemId = btn.dataset.id;
    const itemName = btn.dataset.name;
    const itemPrice = parseFloat(btn.dataset.price);

    if (!itemId || !itemName || Number.isNaN(itemPrice)) {
        showNotification('❌ Product data is missing', 'error');
        return;
    }

    const quantityInput = document.querySelector(`.quantity-input[data-id="${itemId}"]`);
    const quantity = quantityInput ? Math.max(1, parseInt(quantityInput.value) || 1) : 1;

    const existingItem = cart.find(item => String(item.id) === String(itemId));
    if (existingItem) existingItem.quantity += quantity;
    else cart.push({ id: String(itemId), name: itemName, price: itemPrice, quantity });

    saveCart();
    syncCartWithUI();
    showNotification(`✅ ${itemName} added to cart`, 'success');
    if (quantityInput) quantityInput.value = 1;
}

function handleQuantityAdjustment(btn) {
    const itemId = btn.dataset.id;
    const action = btn.dataset.action;
    const quantityInput = document.querySelector(`.quantity-input[data-id="${itemId}"]`);
    if (!quantityInput) return;

    let value = parseInt(quantityInput.value) || 1;
    if (action === 'plus') value++;
    if (action === 'minus' && value > 1) value--;
    quantityInput.value = value;
}

function handleQuantityInputChange(input) {
    const value = parseInt(input.value);
    if (isNaN(value) || value < 1) input.value = 1;
}

function handleCartQuantityButton(btn) {
    const itemId = btn.dataset.id;
    const action = btn.dataset.action;
    const item = cart.find(i => String(i.id) === String(itemId));
    if (!item) return;

    if (action === 'plus') item.quantity++;
    if (action === 'minus' && item.quantity > 1) item.quantity--;

    saveCart();
    syncCartWithUI();
}

function handleRemoveCartItem(btn) {
    const itemId = btn.dataset.id;
    cart = cart.filter(item => String(item.id) !== String(itemId));
    saveCart();
    syncCartWithUI();
    showNotification('✅ Item removed from cart', 'success');
}

function syncCartWithUI() {
    updateCartCount();
    updateCartDisplay();
    updateOrderSummary();
    updatePayButtonState();
    updateItemBadges();
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) cartCountElement.textContent = totalItems;
}

function updateCartDisplay() {
    const cartItemsList = document.getElementById('cart-items-list');
    const whatsappBtn = document.getElementById('send-order-btn');
    const payNowBtn = document.getElementById('pay-now-btn');

    if (!cartItemsList) return;

    if (cart.length === 0) {
        cartItemsList.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <a href="#menu" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        if (whatsappBtn) whatsappBtn.disabled = true;
        if (payNowBtn) payNowBtn.disabled = true;
        return;
    }

    cartItemsList.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="item-price">${item.price.toFixed(2)} KES</p>
            </div>
            <div class="cart-item-quantity">
                <button class="cart-qty-btn" data-id="${item.id}" data-action="minus">-</button>
                <input type="number" class="cart-qty-input" value="${item.quantity}" min="1" data-id="${item.id}">
                <button class="cart-qty-btn" data-id="${item.id}" data-action="plus">+</button>
            </div>
            <div class="cart-item-total">
                <span>${(item.price * item.quantity).toFixed(2)} KES</span>
            </div>
            <button class="btn-remove-item" data-id="${item.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    if (whatsappBtn) whatsappBtn.disabled = false;
    if (payNowBtn) payNowBtn.disabled = false;
}

function updateOrderSummary() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const subtotalEl = document.getElementById('subtotal');
    const totalItemsEl = document.getElementById('total-items');
    const totalPriceEl = document.getElementById('total-price');

    if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2) + ' KES';
    if (totalItemsEl) totalItemsEl.textContent = totalItems;
    if (totalPriceEl) totalPriceEl.textContent = subtotal.toFixed(2) + ' KES';
}

function updatePayButtonState() {
    const payNowBtn = document.getElementById('pay-now-btn');
    if (payNowBtn) payNowBtn.disabled = cart.length === 0;
}

function updateItemBadges() {
    document.querySelectorAll('.menu-item, .gallery-item').forEach(el => {
        const id = el.getAttribute('data-id');
        const item = cart.find(i => String(i.id) === String(id));

        let badge = el.querySelector('.added-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'added-badge';
            el.style.position = 'relative';
            el.appendChild(badge);
        }

        if (item) {
            badge.textContent = `In Cart: ${item.quantity}`;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    });
}

function saveCart() {
    localStorage.setItem('paulCoffeeCart', JSON.stringify(cart));
}

function clearCart() {
    cart = [];
    saveCart();
    syncCartWithUI();
    showNotification('✅ Cart cleared', 'success');
}

function setupPaymentControls() {
    const paymentMethod = document.getElementById('payment-method');
    const mpesaGroup = document.getElementById('mpesa-phone-group');
    const bankGroup = document.getElementById('bank-details-group');
    const mpesaPhone = document.getElementById('mpesa-phone');
    const storedPhone = localStorage.getItem('paulCoffeeMpesaPhone');

    if (mpesaPhone && storedPhone) mpesaPhone.value = storedPhone;
    if (!paymentMethod) return;

    const updateVisibility = () => {
        if (mpesaGroup) mpesaGroup.style.display = paymentMethod.value === 'mpesa' ? 'block' : 'none';
        if (bankGroup) bankGroup.style.display = paymentMethod.value === 'bank' ? 'block' : 'none';
    };

    updateVisibility();
    paymentMethod.addEventListener('change', updateVisibility);
}

async function startOnlinePayment() {
    if (cart.length === 0) {
        showNotification('⚠️ Your cart is empty', 'warning');
        return;
    }

    const customerName = document.getElementById('customer-name')?.value.trim();
    const customerEmail = document.getElementById('customer-email')?.value.trim();
    const customerPhone = document.getElementById('customer-phone')?.value.trim();
    const paymentMethod = document.getElementById('payment-method');
    const mpesaPhone = document.getElementById('mpesa-phone');

    if (!customerName || !customerEmail || !customerPhone) {
        showNotification('⚠️ Please fill customer name, email, and phone', 'warning');
        return;
    }

    const method = paymentMethod ? paymentMethod.value : 'visa';
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const payload = {
        orderId: 'ORD-' + Date.now(),
        amount: subtotal,
        currency: 'KES',
        method,
        customer: { name: customerName, email: customerEmail, phone: customerPhone },
        items: cart,
        mpesaPhone: mpesaPhone ? mpesaPhone.value : ''
    };

    try {
        showNotification('⏳ Preparing payment...', 'info', 2000);

        const response = await fetch('/api/create-payment-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);

        if (data.paymentUrl) {
            window.location.href = data.paymentUrl;
            return;
        }

        if (data.paymentMode === 'bank' && data.bankDetails) {
            showNotification('🏦 Bank details loaded in checkout.', 'success', 5000);
            return;
        }

        if (data.paymentMode === 'mpesa') {
            showNotification('📲 M-Pesa payment request prepared.', 'success', 5000);
            return;
        }

        throw new Error('No payment URL returned');
    } catch (error) {
        console.error('Payment error:', error);
        showNotification('❌ Payment server not ready or wrong URL.', 'error', 6000);
    }
}

function sendOrderToWhatsApp() {
    if (cart.length === 0) {
        showNotification('⚠️ Your cart is empty', 'warning');
        return;
    }

    const orderDetails = cart.map(item => `• ${item.name} x${item.quantity} - ${(item.price * item.quantity).toFixed(2)} KES`).join('\n');
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const message = encodeURIComponent(
        `🛒 *NEW ORDER FROM PAUL MWANIKI COFFEE SHOP*\n\n` +
        `📝 *Items Ordered:*\n${orderDetails}\n\n` +
        `💰 *Total: ${subtotal.toFixed(2)} KES*\n\n` +
        `🙏 Thank you for your order.`
    );

    window.open(`https://wa.me/96598915665?text=${message}`, '_blank');
}

function scrollToCart() {
    const cartSection = document.getElementById('cart');
    if (cartSection) cartSection.scrollIntoView({ behavior: 'smooth' });
}

function handleWhatsAppWelcome() {
    if (!localStorage.getItem('paulCoffeeVisited')) {
        localStorage.setItem('paulCoffeeVisited', 'true');
        setTimeout(() => showNotification('👋 Welcome to Paul Mwaniki Coffee Shop!', 'info', 5000), 1200);
    }
}

function setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger && navMenu) hamburger.addEventListener('click', () => navMenu.classList.toggle('active'));
}

function showNotification(message, type = 'info', duration = 3000) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast-notification show ${type}`;
    setTimeout(() => toast.classList.remove('show'), duration);
}
