<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Paul Coffee Shop</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <i class="fas fa-coffee"></i> Paul Coffee Shop
            </div>
            <ul class="nav-menu">
                <li><a href="#home" class="nav-link">Home</a></li>
                <li><a href="#menu" class="nav-link">Menu</a></li>
                <li><a href="#gallery" class="nav-link">Gallery</a></li>
                <li><a href="#about" class="nav-link">About</a></li>
                <li><a href="#cart" class="nav-link cart-link">Cart <span class="cart-count">0</span></a></li>
                <li><a href="#contact" class="nav-link nav-cta">Contact</a></li>
            </ul>
            <div class="hamburger">
                <span></span><span></span><span></span>
            </div>
        </div>
    </nav>

    <section id="home" class="hero">
        <div class="hero-content">
            <h1>Welcome to Paul Coffee Shop</h1>
            <p>Premium coffee, pastries, and fast ordering.</p>
            <a href="#menu" class="btn btn-primary">Order Now</a>
        </div>
    </section>

    <section class="whatsapp-section">
        <div class="whatsapp-container">
            <div class="whatsapp-icon"><i class="fab fa-whatsapp"></i></div>
            <h2>WhatsApp Ordering</h2>
            <p class="whatsapp-welcome">Thank you for contacting us.</p>
            <p class="whatsapp-message">Chat with us to ask about menu items, custom orders, or delivery.</p>
            <a href="https://wa.me/96598915665" target="_blank" class="btn btn-whatsapp">
                <i class="fab fa-whatsapp"></i> Chat on WhatsApp
            </a>
            <p class="whatsapp-number">+965 9891 5665</p>
        </div>
    </section>

    <section id="menu" class="menu">
        <h2>Menu</h2>
        <div class="menu-grid">
            <div class="menu-category">
                <h3><i class="fas fa-mug-hot"></i> Hot Drinks</h3>
                <div class="menu-items">
                    <div class="menu-item" data-id="1" data-name="Espresso" data-price="2.50">
                        <div class="item-header">
                            <h4>Espresso</h4>
                            <span class="price">2.50 KD</span>
                        </div>
                        <p>Rich and bold.</p>
                        <div class="item-controls">
                            <button class="btn-quantity" data-id="1" data-action="minus">-</button>
                            <input type="number" class="quantity-input" data-id="1" value="1" min="1">
                            <button class="btn-quantity" data-id="1" data-action="plus">+</button>
                            <button class="btn-add-to-cart" data-id="1" data-name="Espresso" data-price="2.50">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="menu-category">
                <h3><i class="fas fa-croissant"></i> Pastries</h3>
                <div class="menu-items">
                    <div class="menu-item" data-id="2" data-name="Croissant" data-price="2.00">
                        <div class="item-header">
                            <h4>Croissant</h4>
                            <span class="price">2.00 KD</span>
                        </div>
                        <p>Fresh and flaky.</p>
                        <div class="item-controls">
                            <button class="btn-quantity" data-id="2" data-action="minus">-</button>
                            <input type="number" class="quantity-input" data-id="2" value="1" min="1">
                            <button class="btn-quantity" data-id="2" data-action="plus">+</button>
                            <button class="btn-add-to-cart" data-id="2" data-name="Croissant" data-price="2.00">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="gallery" class="gallery">
        <h2>Gallery</h2>
        <p class="gallery-subtitle">Selected favorites from our shop.</p>

        <div class="gallery-grid">
            <div class="gallery-item" data-id="1" data-name="Espresso" data-price="2.50">
                <div class="gallery-image-wrapper">
                    <i class="fas fa-coffee gallery-icon"></i>
                    <div class="gallery-overlay">
                        <div class="overlay-content">
                            <h3>Espresso</h3>
                            <p>Our signature shot.</p>
                            <span class="price-badge">2.50 KD</span>
                            <button class="btn-add-to-cart" data-id="1" data-name="Espresso" data-price="2.50">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="about" class="about">
        <div class="about-content">
            <h2>About Us</h2>
            <p>We serve fresh coffee and pastries with simple, fast ordering and flexible payment options.</p>
            <div class="stats">
                <div class="stat"><h3>1000+</h3><p>Orders</p></div>
                <div class="stat"><h3>20+</h3><p>Items</p></div>
                <div class="stat"><h3>24/7</h3><p>Support</p></div>
            </div>
        </div>
    </section>

    <section id="cart" class="cart-section">
        <h2>Cart</h2>
        <div class="cart-container">
            <div id="cart-items-list" class="cart-items-list">
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                </div>
            </div>

            <div class="cart-summary">
                <h3>Order Summary</h3>

                <div class="summary-item">
                    <span>Customer Name:</span>
                    <input type="text" id="customer-name" placeholder="Your name">
                </div>

                <div class="summary-item">
                    <span>Customer Email:</span>
                    <input type="email" id="customer-email" placeholder="Your email">
                </div>

                <div class="summary-item">
                    <span>Customer Phone:</span>
                    <input type="tel" id="customer-phone" placeholder="Your phone">
                </div>

                <div class="summary-item">
                    <span>Payment Method:</span>
                    <select id="payment-method" class="payment-select">
                        <option value="visa">Visa</option>
                        <option value="mastercard">Mastercard</option>
                        <option value="knet">KNET</option>
                        <option value="mpesa">M-Pesa</option>
                        <option value="bank">Bank Transfer</option>
                    </select>
                </div>

                <div class="summary-item" id="mpesa-phone-group" style="display:none;">
                    <span>M-Pesa Phone:</span>
                    <input type="tel" id="mpesa-phone" placeholder="e.g. 25494824443">
                </div>

                <div class="summary-item" id="bank-details-group" style="display:none;">
                    <div class="bank-details">
                        <p><strong>Bank:</strong> Co-operative Bank of Kenya</p>
                        <p><strong>Account No:</strong> 01234566678</p>
                    </div>
                </div>

                <div class="summary-item">
                    <span>Subtotal:</span>
                    <span id="subtotal">0.00 KD</span>
                </div>

                <div class="summary-item">
                    <span>Total Items:</span>
                    <span id="total-items">0</span>
                </div>

                <div class="summary-item total">
                    <span>Total:</span>
                    <span id="total-price">0.00 KD</span>
                </div>

                <button id="pay-now-btn" class="btn btn-primary btn-full" disabled>
                    <i class="fas fa-lock"></i> Pay Now
                </button>

                <button id="send-order-btn" class="btn btn-primary btn-full" disabled>
                    <i class="fab fa-whatsapp"></i> Send Order to WhatsApp
                </button>

                <button id="clear-cart-btn" class="btn btn-danger btn-full">
                    <i class="fas fa-trash"></i> Clear Cart
                </button>
            </div>
        </div>
    </section>

    <section id="contact" class="contact">
        <h2>Contact</h2>
        <div class="contact-content">
            <div class="contact-info">
                <div class="info-item">
                    <i class="fas fa-phone"></i>
                    <h3>WhatsApp</h3>
                    <p>+965 9891 5665</p>
                </div>
            </div>
        </div>
    </section>

    <div id="toast-notification" class="toast-notification"></div>

    <footer class="footer">
        <div class="footer-content">
            <p>&copy; 2026 Paul Coffee Shop</p>
        </div>
    </footer>

    <script src="script.js"></script>
</body>
</html>
