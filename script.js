// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Close mobile menu when clicking on a nav link
const navLinks = document.querySelectorAll('.nav-link');
const menuToggle = document.getElementById('mainNav');

if (menuToggle) {
    const bsCollapse = new bootstrap.Collapse(menuToggle, {toggle: false});
    
    navLinks.forEach(l => {
        l.addEventListener('click', () => {
            if (menuToggle.classList.contains('show')) {
                bsCollapse.toggle();
            }
        });
    });
}

// Initialize cart manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Handle account links
    const accountLinks = document.querySelectorAll('a[title="Account"], a[title="account"]');
    accountLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'login.html';
        });
    });

    // Add cart count to all cart icons
    const cartIcons = document.querySelectorAll('.cart, [title="Cart"], [title="cart"]');
    cartIcons.forEach(icon => {
        // Create cart count element if it doesn't exist
        if (!icon.querySelector('.cart-count')) {
            const countEl = document.createElement('span');
            countEl.className = 'cart-count';
            icon.appendChild(countEl);
            
            // Position the count element absolutely within the icon
            icon.style.position = 'relative';
            countEl.style.position = 'absolute';
            countEl.style.top = '-5px';
            countEl.style.right = '-5px';
        }
    });

    // Load cart count on page load
    updateCartCount();
});

// Update cart count in the UI
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('winterCollectionCart') || '[]');
    const totalItems = cart.reduce((total, item) => total + (item.quantity || 0), 0);
    
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = totalItems;
        el.style.display = totalItems > 0 ? 'flex' : 'none';
    });
}

// Expose updateCartCount to window for cart.js to use
window.updateCartCount = updateCartCount;

// Create snowflakes for winter effect
function createSnowflakes() {
    const snowflakes = ['❄', '❅', '❆', '•', '·'];
    const body = document.body;
    
    function createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
        
        // Random position and size
        const size = Math.random() * 1.5 + 0.5; // 0.5em to 2em
        const startPosition = Math.random() * 100; // 0% to 100% of viewport width
        const animationDuration = Math.random() * 10 + 10; // 10s to 20s
        const delay = Math.random() * 5; // 0s to 5s delay
        const opacity = Math.random() * 0.7 + 0.3; // 0.3 to 1.0
        
        // Apply styles
        snowflake.style.left = `${startPosition}%`;
        snowflake.style.fontSize = `${size}em`;
        snowflake.style.opacity = opacity;
        snowflake.style.animationDuration = `${animationDuration}s`;
        snowflake.style.animationDelay = `${delay}s`;
        
        // Add slight horizontal movement
        const keyframes = `
            @keyframes fall-${Date.now()} {
                0% { transform: translateX(0) translateY(-10%) rotate(0deg); }
                100% { 
                    transform: 
                        translateX(${Math.random() * 200 - 100}px) 
                        translateY(110vh) 
                        rotate(${Math.random() * 360}deg); 
                }
            }
        `;
        
        const style = document.createElement('style');
        style.innerHTML = keyframes;
        document.head.appendChild(style);
        
        snowflake.style.animationName = `fall-${Date.now()}`;
        
        // Remove snowflake after animation completes
        snowflake.addEventListener('animationend', () => {
            snowflake.remove();
            style.remove();
        });
        
        body.appendChild(snowflake);
    }
    
    // Create initial snowflakes
    for (let i = 0; i < 30; i++) {
        setTimeout(createSnowflake, i * 300);
    }
    
    // Keep adding snowflakes periodically
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            createSnowflake();
        }
    }, 500);
}

// Start snowflakes when DOM is loaded
document.addEventListener('DOMContentLoaded', createSnowflakes);
