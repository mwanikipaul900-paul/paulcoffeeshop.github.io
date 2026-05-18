let cart = JSON.parse(localStorage.getItem('paulCoffeeCart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    syncCartWithUI();
    handleWhatsAppWelcome();
    setupPaymentControls();
    trackPageView();
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
        const checkoutBtn = e.target.closest('.cart-link');

        if (addBtn) {
            e.preventDefault();
            handleAddToCart(addBtn);
            return;
        }
        if (qtyBtn) {
            e.preventDefault();
            handleQuantityAdjustment(qtyBtn);
            return;
        }
        if (cartQtyBtn) {
            e.preventDefault();
            handleCartQuantityButton(cartQtyBtn);
            return;
        }
        if (removeBtn) {
            e.preventDefault();
            handleRemoveCartItem(removeBtn);
            return;
        }
        if (clearBtn) {
            e.preventDefault();
            clearCart();
            return;
        }
        if (whatsappBtn) {
            e.preventDefault();
            sendOrderToWhatsApp();
            return;
        }
        if (payNowBtn) {
            e.preventDefault();
            startOnlinePayment();
            return;
        }
        if (checkoutBtn) {
            e.preventDefault();
            scrollToCart();
        }
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

    const quantityInput = document.querySelector(`.quantity-input[data-id="${itemId}"]`);
    const quantity = quantityInput ? Math.max(1, parseInt(quantityInput.value) || 1) : 1;

    const existingItem = cart.find(item => String(item.id) === String(itemId));
    if (existingItem) existingItem.quantity += quantity;
    else cart.push({ id: String(itemId), name: itemName, price: itemPrice, quantity });

    saveCart();
    syncCartWithUI();
    showNotification(`✅ ${itemName} added to cart (${quantity})`, 'success');
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
    const item = cart.find(i => 
