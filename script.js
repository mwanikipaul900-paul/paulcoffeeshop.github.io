// ============================================================================
// PAUL COFFEE SHOP - AUTOMATION SYSTEM
// Features: Cart Management, Image Upload, WhatsApp Integration
// ============================================================================

// ============================================================================
// 1. CART MANAGEMENT SYSTEM
// ============================================================================

let cart = JSON.parse(localStorage.getItem('paulCoffeeCart')) || [];

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeCart();
    setupEventListeners();
    syncCartWithUI();
});

// Setup all event listeners
function setupEventListeners() {
    // Add to cart buttons
    document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
        btn.addEventListener('click', handleAddToCart);
    });

    // Quantity adjustment buttons
    document.querySelectorAll('.btn-quantity').forEach(btn => {
        btn.addEventListener('click', handleQuantityAdjustment);
    });

    // Quantity input fields
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', handleQuantityInputChange);
    });

    // Cart action buttons
    document.getElementById('clear-cart-btn').addEventListener('click', clearCart);
    document.getElementById('send-order-btn').addEventListener('click', sendOrderToWhatsApp);
    document.getElementById('checkout-btn').addEventListener('click', scrollToCart);
    document.getElementById('gallery-checkout-btn').addEventListener('click', scrollToCart);

    // Hamburger menu
    setupHamburgerMenu();

    // WhatsApp integration for new visitors
    handleWhatsAppWelcome();
}

// Initialize cart from localStorage
function initializeCart() {
    cart = JSON.parse(localStorage.getItem('paulCoffeeCart')) || [];
}

// ============================================================================
// ADD TO CART FUNCTIONALITY
// ============================================================================

function handleAddToCart(e) {
    const btn = e.target.closest('.btn-add-to-cart');
    const itemId = btn.getAttribute('data-id');
    const itemName = btn.getAttribute('data-name');
    const itemPrice = parseFloat(btn.getAttribute('data-price'));
    
    // Get quantity from the quantity input if available
    const quantityInput = document.querySelector(`.quantity-input[data-id="${itemId}"]`);
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

    // Check if item already exists in cart
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

    // Save to localStorage
    saveCart();
    syncCartWithUI();
    showNotification(`✅ ${itemName} added to cart!`);

    // Reset quantity input to 1
    if (quantityInput) {
        quantityInput.value = 1;
    }
}

// ============================================================================
// QUANTITY MANAGEMENT
// ============================================================================

function handleQuantityAdjustment(e) {
    const btn = e.target;
    const itemId = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');
    const quantityInput = document.querySelector(`.quantity-input[data-id="${itemId}"]`);

    if (!quantityInput) return;

    let currentValue = parseInt(quantityInput.value);

    if (action === 'plus') {
        currentValue++;
    } else if (action === 'minus' && currentValue > 1) {
        currentValue--;
    }

    quantityInput.value = currentValue;
}

function handleQuantityInputChange(e) {
    const input = e.target;
    const itemId = input.getAttribute('data-id');
    let value = parseInt(input.value);

    // Validate input
    if (isNaN(value) || value < 1) {
        input.value = 1;
    }
}

// ============================================================================
// CART UI SYNCHRONIZATION
// ============================================================================

function syncCartWithUI() {
    updateCartCount();
    updateCartDisplay();
    updateOrderSummary();
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

function updateCartDisplay() {
    const cartItemsList = document.getElementById('cart-items-list');
    
    if (cart.length === 0) {
        cartItemsList.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <a href="#menu" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        document.getElementById('send-order-btn').disabled = true;
        return;
    }

    cartItemsList.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="item-price">${item.price.toFixed(2)} KD</p>
            </div>
            <div class="cart-item-quantity">
                <button class="cart-qty-btn" onclick="updateCartQuantity(${item.id}, -1)">-</button>
                <input type="number" value="${item.quantity}" min="1" onchange="updateCartQuantity(${item.id}, this.value - ${item.quantity})">
                <button class="cart-qty-btn" onclick="updateCartQuantity(${item.id}, 1)">+</button>
            </div>
            <div class="cart-item-total">
                <span>${(item.price * item.quantity).toFixed(2)} KD</span>
            </div>
            <button class="btn-remove-item" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    document.getElementById('send-order-btn').disabled = false;
}

function updateOrderSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    document.getElementById('subtotal').textContent = subtotal.toFixed(2) + ' KD';
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('total-price').textContent = subtotal.toFixed(2) + ' KD';
}

function updateCartQuantity(itemId, change) {
    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.quantity = Math.max(1, item.quantity + parseInt(change));
        saveCart();
        syncCartWithUI();
    }
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
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

// ============================================================================
// 2. WHATSAPP INTEGRATION & INSTANT WELCOME MESSAGES
// ============================================================================

// Auto-send WhatsApp welcome message on first visit
function handleWhatsAppWelcome() {
    const hasVisited = localStorage.getItem('paulCoffeeVisited');
    
    if (!hasVisited) {
        // Mark as visited
        localStorage.setItem('paulCoffeeVisited', 'true');
        
        // Show welcome notification after 2 seconds
        setTimeout(() => {
            showNotification('👋 Welcome to Paul Coffee Shop! Chat with us on WhatsApp for instant support!', 'info', 5000);
        }, 2000);

        // Optional: Auto-trigger WhatsApp welcome (uncomment to enable)
        // triggerWhatsAppWelcome();
    }
}

// Trigger WhatsApp welcome message
function triggerWhatsAppWelcome() {
    const welcomeMessage = encodeURIComponent(
        '👋 Hello! I just discovered Paul Coffee Shop. Welcome to their store!\n\n' +
        '🏪 Shop: Paul Coffee Shop\n' +
        '⏰ Hours: 8am - 11pm\n' +
        '☕ Quality Coffee & Pastries\n\n' +
        'Tell me more about your menu & special offers!'
    );
    
    const whatsappUrl = `https://wa.me/96598915665?text=${welcomeMessage}`;
    // Uncomment line below to auto-open WhatsApp
    // window.open(whatsappUrl, '_blank');
}

function sendOrderToWhatsApp() {
    if (cart.length === 0) {
        showNotification('⚠️ Your cart is empty', 'warning');
        return;
    }

    // Build order message
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

    // Clear cart after sending
    setTimeout(() => {
        showNotification('✅ Order sent! Our team will contact you shortly.', 'success', 4000);
    }, 500);
}

// ============================================================================
// 3. IMAGE UPLOAD FUNCTIONALITY
// ============================================================================

// Initialize image upload system
function initImageUpload() {
    const dropZones = document.querySelectorAll('[data-upload-zone]');
    
    dropZones.forEach(zone => {
        // Drag and drop events
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleImageDrop);

        // Click to upload
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
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification('❌ Please upload image files only', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('❌ Image size must be less than 5MB', 'error');
            return;
        }

        // Read and display image
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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Toast notification system
function showNotification(message, type = 'info', duration = 3000) {
    const toast = document.getElementById('toast-notification');
    toast.textContent = message;
    toast.className = `toast-notification show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Scroll to cart section
function scrollToCart() {
    const cartSection = document.getElementById('cart');
    cartSection.scrollIntoView({ behavior: 'smooth' });
}

// Hamburger menu toggle
function setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Close menu when link is clicked
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
}

// ============================================================================
// ADVANCED FEATURES - ANALYTICS & TRACKING
// ============================================================================

// Track page views
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

// Track cart abandonment
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

// Log cart events
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

// Initialize analytics
window.addEventListener('beforeunload', trackCartAbandonment);
document.addEventListener('DOMContentLoaded', trackPageView);

// ============================================================================
// EXPORT FUNCTIONS FOR CONSOLE USE
// ============================================================================

// Get cart analytics
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

// Clear all data (admin function)
function clearAllData() {
    if (confirm('This will clear all stored data. Are you sure?')) {
        localStorage.clear();
        cart = [];
        location.reload();
    }
}

// Console commands available:
// getCartAnalytics() - View all analytics
// clearAllData() - Clear all stored data
console.log('%c✨ Paul Coffee Shop Automation Ready!', 'font-size: 16px; color: #8B4513; font-weight: bold;');
console.log('%cAvailable Commands:', 'font-size: 12px; color: #555;');
console.log('- getCartAnalytics() - View all stored data');
console.log('- clearAllData() - Clear all data');
console.log('- sendOrderToWhatsApp() - Send current cart to WhatsApp');
console.log('- initImageUpload() - Initialize image upload system');
