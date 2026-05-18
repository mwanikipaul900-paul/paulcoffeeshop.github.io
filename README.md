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
            <p>Premium coffee, cakes, desserts, and fast ordering.</p>
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
                <h3><i class="fas fa-mug-hot"></i> Hot Coffee</h3>
                
