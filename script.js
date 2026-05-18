let cart = JSON.parse(localStorage.getItem('paulCoffeeCart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    syncCartWithUI();
    handleWhatsAppWelcome();
    setupPaymentControls();
    trackPageView();
}

function setupEventListeners() {
    document.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.btn-add-to-cart');
        const qtyBtn = e.target.closest('.btn-quantity');
        const clearBtn = e.target.closest('#clear-cart-btn');
        const whatsappBtn = e.target.closest('#send-order-btn');
        const checkoutBtn = e.target.closest('#checkout-btn');
        const galleryCheckoutBtn = e.target.closest('#gallery-checkout-btn');
        const payNowBtn = e.target.closest('#pay-now-btn');
        const cartItemQtyBtn = e.target.closest('.cart-qty-btn');
        const removeBtn = e.target.closest('.btn-remove-item');

        if (addBtn) handleAddToCart(addBtn);
        if (qtyBtn) handleQuantityAdjustment(qtyBtn);
        if (clearBtn) clearCart();
        if (whatsappBtn) sendOrderToWhatsApp();
        if (checkoutBtn) scrollToCart();
        if (galleryCheckoutBtn) scrollToCart();
        if (payNowBtn) startOnlinePayment();
        if (cartItemQtyBtn) handleCartQuantityButton(cartItemQtyBtn);
        if (removeBtn) handleRemoveCartItem(removeBtn);
    });

    document.addEventListener('change', (e) => {
        if (e.target.matches('.quantity-input')) {
            handleQuantityInputChange(e.target);
        }
        if (e.target.matches('#payment-method')) {
            handlePaymentMethodChange();
        }
        if (e.target.matches('#mpesa-phone')) {
            saveMpesaPhone(e.target.value);
        }
    });

    setupHamburgerMenu();
}

function handleAddToCart(btn) {
    const itemId = btn.getAttribute('data-id');
    const itemName = btn.getAttribute('data-name');
    const itemPrice = parseFloat(btn.getAttribute('data-price'));

    const quantityInput = document.querySelector(`.quantity-input[data-id="${itemId}"]`);
    const quantity = quantityInput ? Math.max(1, parseInt(quantityInput.value)) : 1;

    const existingItem = cart.find(item => item.id === itemId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id: itemId, name: itemName, price: itemPrice, quantity });
    }

    saveCart();
    syncCartWithUI();
    showNotification(`✅ ${itemName} added to cart (${quantity})`);
    updateItemBadges(itemId);

    if (quantityInput) quantityInput.value = 1;
}

function updateItemBadges(itemId) {
    const itemEls = document.querySelectorAll(`.menu-item[data-id="${itemId}"], .gallery-item[data-id="${itemId}"]`);
    const cartItem = cart.find(item => item.id === String(itemId));

    itemEls.forEach(el => {
        let badge = el.querySelector('.added-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'added-badge';
            el.style.position = 'relative';
            el.appendChild(badge);
        }

        if (cartItem) {
            badge.textContent = `In Cart: ${cartItem.quantity}`;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    });
}

function handleQuantityAdjustment(btn) {
    const itemId = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');
    const quantityInput = document.querySelector(`.quantity-input[data-id="${itemId}"]`);
    if (!quantityInput) return;

    let currentValue = parseInt(quantityInput.value) || 1;
    if (action === 'plus') currentValue++;
    if (action === 'minus' && currentValue > 1) currentValue--;

    quantityInput.value = currentValue;
}

function handleQuantityInputChange(input) {
    let value = parseInt(input.value);
    if (isNaN(value) || value < 1) input.value = 1;
}

function syncCartWithUI() {
    updateCartCount();
    updateCartDisplay();
    updateOrderSummary();
    updatePayButtonState();
    updateAllItemBadges();
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) cartCountElement.textContent = totalItems;
}

function updateAllItemBadges() {
    document.querySelectorAll('.menu-item, .gallery-item').forEach(el => {
        const id = el.getAttribute('data-id');
        const item = cart.find(i => i.id === id);

        let badge = el.querySelector('.added-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'added-badge';
            el.style.position = 'relative';
            el.appendChild(badge);
        }

        if (item) 
