let cart = JSON.parse(localStorage.getItem('paulCoffeeCart')) || [];
const DEFAULT_MPESA_PHONE = '254794824443';

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
    const hamburger = e.target.closest('.hamburger');

    if (addBtn) { e.preventDefault(); handleAddToCart(addBtn); return; }
    if (qtyBtn) { e.preventDefault(); handleQuantityAdjustment(qtyBtn); return; }
    if (cartQtyBtn) { e.preventDefault(); handleCartQuantityButton(cartQtyBtn); return; }
    if (removeBtn) { e.preventDefault(); handleRemoveCartItem(removeBtn); return; }
    if (clearBtn) { e.preventDefault(); clearCart(); return; }
    if (whatsappBtn) { e.preventDefault(); sendOrderToWhatsApp(); return; }
    if (payNowBtn) { e.preventDefault(); startOnlinePayment(); return; }
    if (cartLink) { e.preventDefault(); scrollToCart(); return; }
    if (hamburger) { e.preventDefault(); setupHamburgerMenu(); return; }
  });

  document.addEventListener('change', (e) => {
    if (e.target.matches('.quantity-input')) handleQuantityInputChange(e.target);
    if (e.target.matches('.cart-qty-input')) handleCartQuantityInputChange(e.target);
    if (e.target.matches('#payment-method')) updatePaymentControls();
    if (e.target.matches('#mpesa-phone')) {
      localStorage.setItem('paulCoffeeMpesaPhone', e.target.value || DEFAULT_MPESA_PHONE);
    }
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

function handleCartQuantityInputChange(input) {
  const itemId = input.dataset.id;
  const item = cart.find(i => String(i.id) === String(itemId));
  if (!item) return;

  item.quantity = Math.max(1, parseInt(input.value) || 1);
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
  updatePaymentControls();
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
        <p class="item-price">${item.price.toFixed(0)} KES</p>
      </div>
      <div class="cart-item-quantity">
        <button class="cart-qty-btn" data-id="${item.id}" data-action="minus">-</button>
        <input type="number" class="cart-qty-input" value="${item.quantity}" min="1" data-id="${item.id}">
        <button class="cart-qty-btn" data-id="${item.id}" data-action="plus">+</button>
      </div>
      <div class="cart-item-total"><span>${(item.price * item.quantity).toFixed(0)} KES</span></div>
      <button class="btn-remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
    </div>
  `).join('');

  if (whatsappBtn) whatsappBtn.disabled = false;
  if (payNowBtn) payNowBtn.disabled = false;
}

function updateOrderSummary() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (document.getElementById('subtotal')) document.getElementById('subtotal').textContent = subtotal.toFixed(0) + ' KES';
  if (document.getElementById('total-items')) document.getElementById('total-items').textContent = totalItems;
  if (document.getElementById('total-price')) document.getElementById('total-price').textContent = subtotal.toFixed(0) + ' KES';
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
  updatePaymentControls();
  const mpesaPhone = document.getElementById('mpesa-phone');
  const storedPhone = localStorage.getItem('paulCoffeeMpesaPhone') || DEFAULT_MPESA_PHONE;
  if (mpesaPhone && !mpesaPhone.value) mpesaPhone.value = storedPhone;
}

function updatePaymentControls() {
  const paymentMethod = document.getElementById('payment-method');
  const mpesaGroup = document.getElementById('mpesa-phone-group');
  const bankGroup = document.getElementById('bank-details-group');
  if (!paymentMethod) return;

  if (mpesaGroup) mpesaGroup.style.display = paymentMethod.value === 'mpesa' ? 'block' : 'none';
  if (bankGroup) bankGroup.style.display = paymentMethod.value === 'bank' ? 'block' : 'none';
}

async function startOnlinePayment() {
  if (cart.length === 0) {
    showNotification('⚠️ Your cart is empty', 'warning');
    return;
  }

  const customerName = document.getElementById('customer-name')?.value.trim();
  const customerEmail = document.getElementById('customer-email')?.value.trim();
  const customerPhone = document.getElementById('customer-phone')?.value.trim();
  const paymentMethod = document.getElementById('payment-method')?.value || 'visa';
  const mpesaPhone = document.getElementById('mpesa-phone')?.value.trim() || DEFAULT_MPESA_PHONE;

  if (!customerName || !customerEmail || !customerPhone) {
    showNotification('⚠️ Please fill customer name, email, and phone', 'warning');
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const payload = {
    orderId: 'ORD-' + Date.now(),
    amount: subtotal,
    currency: 'KES',
    method: paymentMethod,
    customer: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone
    },
    items: cart,
    mpesaPhone
  };

  try {
    showNotification('⏳ Preparing payment...', 'info', 2000);

    const response = await fetch('http://localhost:3001/api/create-payment-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const contentType = response.headers.get('content-type') || '';
    const rawText = await response.text();
    console.log('Raw response:', rawText);

    if (!contentType.includes('application/json')) {
      throw new Error('Server returned HTML instead of JSON');
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error('Invalid JSON returned by server');
    }

    if (!response.ok || !data.success) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    if (data.paymentMode === 'mpesa' && data.stkResponse) {
      showNotification('📲 M-Pesa test response received.', 'success', 5000);
      console.log('STK response:', data.stkResponse);
      return;
    }

    if (data.paymentMode === 'bank' && data.bankDetails) {
      showNotification('🏦 Bank details loaded successfully.', 'success', 5000);
      console.log('Bank details:', data.bankDetails);
      return;
    }

    if (data.paymentUrl) {
      window.location.href = data.paymentUrl;
      return;
    }

    showNotification('✅ Test payment route returned JSON successfully.', 'success', 5000);
  } catch (error) {
    console.error('Payment error:', error);
    showNotification(`❌ ${error.message}`, 'error', 6000);
  }
}

function sendOrderToWhatsApp() {
  if (cart.length === 0) {
    showNotification('⚠️ Your cart is empty', 'warning');
    return;
  }
  const orderDetails = cart.map(item => `• ${item.name} x${item.quantity} - ${(item.price * item.quantity).toFixed(0)} KES`).join('\n');
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const message = encodeURIComponent(`🛒 *NEW ORDER FROM PAUL MWANIKI COFFEE SHOP*\n\n📝 *Items Ordered:*\n${orderDetails}\n\n💰 *Total: ${subtotal.toFixed(0)} KES*\n\n🙏 Thank you for your order.`);
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
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => navMenu.classList.toggle('active'));
  }
}

function showNotification(message, type = 'info', duration = 3000) {
  const toast = document.getElementById('toast-notification');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast-notification show ${type}`;
  setTimeout(() => toast.classList.remove('show'), duration);
}