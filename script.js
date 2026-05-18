let cart = JSON.parse(localStorage.getItem('paulCoffeeCart')) || [];

document.addEventListener('DOMContentLoaded', () => {
  syncCartWithUI();
  setupEvents();
});

function setupEvents() {
  document.addEventListener('click', e => {
    if (e.target.classList.contains('btn-add-to-cart')) handleAddToCart(e.target);
    if (e.target.id === 'clear-cart-btn') clearCart();
    if (e.target.id === 'pay-now-btn') startOnlinePayment();
    if (e.target.id === 'send-order-btn') sendOrderToWhatsApp();
  });
  document.getElementById('payment-method').addEventListener('change', setupPaymentControls);
}

function handleAddToCart(btn) {
  const id = btn.dataset.id;
  const name = btn.dataset.name;
  const price = parseFloat(btn.dataset.price);
  const qtyInput = document.querySelector(`.quantity-input[data-id="${id}"]`);
  const qty = qtyInput ? Math.max(1, parseInt(qtyInput.value) || 1) : 1;

  const existing = cart.find(i => i.id === id);
  if (existing) existing.quantity += qty;
  else cart.push({ id, name, price, quantity: qty });

  saveCart();
  syncCartWithUI();
  showNotification(`${name} added (${qty})`);
}

function saveCart() {
  localStorage.setItem('paulCoffeeCart', JSON.stringify(cart));
}

function clearCart() {
  cart = [];
  saveCart();
  syncCartWithUI();
  showNotification('Cart cleared');
}

function syncCartWithUI() {
  const list = document.getElementById('cart-items-list');
  list.innerHTML = cart.map(item => `
    <div class="cart-item">
      ${item.name} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)} KD
    </div>`).join('');
  document.getElementById('subtotal').textContent =
    cart.reduce((s,i)=>s+i.price*i.quantity,0).toFixed(2)+' KD';
  document.getElementById('total-items').textContent =
    cart.reduce((s,i)=>s+i.quantity,0);
  document.getElementById('total-price').textContent =
    cart.reduce((s,i)=>s+i.price*i.quantity,0).toFixed(2)+' KD';
}

function showNotification(msg) {
  const toast = document.getElementById('toast-notification');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),3000);
}

function setupPaymentControls() {
  const method = document.getElementById('payment-method').value;
  document.getElementById('mpesa-phone-group').style.display =
    method==='mpesa' ? 'block' : 'none';
  document.getElementById('bank-details-group').style.display =
    method==='bank' ? 'block' : 'none';
}

async function startOnlinePayment() {
  if (cart.length === 0) return showNotification('Cart empty');
  const customer = {
    name: document.getElementById('customer-name').value.trim(),
    email: document.getElementById('customer-email').value.trim(),
    phone: document.getElementById('customer-phone').value.trim()
  };
  const method = document.getElementById('payment-method').value;

  if (method === 'mpesa') {
    showNotification(`Please pay via M-Pesa to +254794824443`);
  } else if (method === 'bank') {
    showNotification(`Please transfer to Co-operative Bank of Kenya, Account: 01234566678`);
  } else {
    // Stripe or card integration would go here
    showNotification('Redirecting to card payment...');
  }
}

function sendOrderToWhatsApp() {
  if (cart.length === 0) return showNotification('Cart empty');
  const orderText = cart.map(item =>
    `${item.name} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)} KD`
  ).join('%0A');
  const total = cart.reduce((s,i)=>s+i.price*i.quantity,0).toFixed(2);
  const msg = `Hello Paul, I would like to order:%0A${orderText}%0ATotal: ${total} KD`;
  const whatsappUrl = `https://wa.me/254794824443?text=${msg}`;
  window.open(whatsappUrl, '_blank');
}
