// Cart functionality
class CartManager {
    constructor() {
        console.log('Initializing CartManager...');
        this.userId = localStorage.getItem('userId') || `user_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('userId', this.userId);
        this.cart = [];
        this.initialize();
    }
    
    async initialize() {
        this.setupEventListeners();
        // Load cart from backend
        await this.loadCart();
        this.updateCartCount();
        this.updateSummary();
        
        // If we're on the cart page, update the UI
        if (window.location.pathname.includes('cart.html')) {
            this.renderCart();
        }
    }

    // Load cart from backend
    async loadCart() {
        try {
            // First try to load from localStorage as fallback
            const localCart = localStorage.getItem(`cart_${this.userId}`);
            
            // If we have a local cart, use it immediately for better UX
            if (localCart) {
                this.cart = JSON.parse(localCart);
                console.log('Loaded cart from localStorage:', this.cart);
            }
            
            // Then try to sync with the server
            try {
                const response = await fetch(`/api/cart/${this.userId}`);
                if (response.ok) {
                    const data = await response.json();
                    // Only update if we got valid data
                    if (data && Array.isArray(data.items)) {
                        this.cart = data.items;
                        // Save to localStorage as cache
                        localStorage.setItem(`cart_${this.userId}`, JSON.stringify(this.cart));
                        console.log('Synced cart from server:', this.cart);
                    }
                }
            } catch (serverError) {
                console.warn('Could not sync with server, using local cart:', serverError);
            }
            
            return this.cart;
        } catch (error) {
            console.error('Error loading cart:', error);
            this.cart = [];
            return [];
        }
    }

    // Save cart to backend and update UI
    async saveCart() {
        try {
            // Update localStorage immediately for better UX
            localStorage.setItem(`cart_${this.userId}`, JSON.stringify(this.cart));
            
            // Try to sync with server
            try {
                const response = await fetch(`/api/cart/${this.userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ items: this.cart })
                });

                if (!response.ok) throw new Error('Failed to save cart to server');
            } catch (serverError) {
                console.warn('Could not sync with server, using local cart:', serverError);
            }
            
            // Update UI
            this.updateCartCount();
            this.updateSummary();
            
            // If we're on the cart page, re-render the cart
            if (window.location.pathname.includes('cart.html')) {
                this.renderCart();
            }
            
            return true;
        } catch (error) {
            console.error('Error saving cart:', error);
            return false;
        }
    }
    
    // Format currency helper
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    // Update cart count in the UI
    updateCartCount() {
        const totalItems = this.cart.reduce((total, item) => total + (parseInt(item.quantity) || 1), 0);
        const totalUniqueItems = this.cart.length;
        
        // Update the main cart badge in the navbar
        const mainCartBadge = document.querySelector('.nav-icon.cart .badge');
        if (mainCartBadge) {
            mainCartBadge.textContent = totalItems;
            mainCartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
            mainCartBadge.classList.add('cart-count-update');
            setTimeout(() => mainCartBadge.classList.remove('cart-count-update'), 300);
        }
        
        // Update any other cart count indicators
        document.querySelectorAll('.cart-badge, #cartCount').forEach(el => {
            el.textContent = totalItems;
            el.style.display = totalItems > 0 ? 'flex' : 'none';
        });
        
        // Update item count in summary
        const itemCountElement = document.getElementById('itemCount');
        if (itemCountElement) {
            itemCountElement.textContent = totalItems;
        }
        
        return { totalItems, totalUniqueItems };
    }

    // Calculate subtotal with proper type conversion
    calculateSubtotal() {
        return this.cart.reduce((total, item) => {
            const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.-]+/g,"")) : Number(item.price);
            const quantity = Number(item.quantity) || 1;
            return total + (price * quantity);
        }, 0);
    }

    // Add item to cart
    async addToCart(product) {
        try {
            if (!product || !product.id) {
                throw new Error('Invalid product data');
            }
            
            // Check if product already exists in cart
            const existingItemIndex = this.cart.findIndex(item => item.id === product.id || item.productId === product.id);
            
            if (existingItemIndex >= 0) {
                // Update quantity if item exists
                const updatedCart = [...this.cart];
                updatedCart[existingItemIndex].quantity = (parseInt(updatedCart[existingItemIndex].quantity) || 0) + 1;
                this.cart = updatedCart;
            } else {
                // Add new item
                const newItem = {
                    id: product.id,
                    productId: product.id,
                    name: product.name || 'Product',
                    price: typeof product.price === 'number' ? product.price : parseFloat(String(product.price || '0').replace(/[^0-9.-]+/g,"")),
                    quantity: 1,
                    image: product.image || 'img/placeholder.jpg'
                };
                this.cart = [...this.cart, newItem];
            }
            
            // Save to localStorage immediately for better UX
            localStorage.setItem(`cart_${this.userId}`, JSON.stringify(this.cart));
            
            // Update UI
            this.updateCartCount();
            
            // Show success notification
            this.showNotification('Item added to cart!');
            
            // Try to sync with server in the background
            this.saveCart().catch(error => {
                console.error('Background cart sync failed:', error);
            });
            
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('Failed to add item to cart', 'error');
            return false;
        }
    }
    
    // Update order summary
    updateSummary() {
        try {
            const subtotal = this.cart.reduce((sum, item) => {
                const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.-]+/g,"")) || 0;
                const quantity = parseInt(item.quantity) || 1;
                return sum + (price * quantity);
            }, 0);
            
            const shippingThreshold = 50;
            const shippingCost = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 9.99;
            const taxRate = 0.08; // 8% tax
            const tax = subtotal * taxRate;
            const total = subtotal + shippingCost + tax;
            
            // Update DOM elements
            const elements = {
                subtotal: document.getElementById('subtotal'),
                shipping: document.getElementById('shipping'),
                tax: document.getElementById('tax'),
                total: document.getElementById('total'),
                itemCount: document.getElementById('itemCount')
            };
            
            if (elements.subtotal) elements.subtotal.textContent = this.formatCurrency(subtotal);
            if (elements.shipping) {
                elements.shipping.textContent = shippingCost === 0 ? 'Free' : this.formatCurrency(shippingCost);
                elements.shipping.className = shippingCost === 0 ? 'text-success' : '';
            }
            if (elements.tax) elements.tax.textContent = this.formatCurrency(tax);
            if (elements.total) elements.total.textContent = this.formatCurrency(total);
            if (elements.itemCount) {
                const itemCount = this.cart.reduce((count, item) => count + (parseInt(item.quantity) || 0), 0);
                elements.itemCount.textContent = itemCount;
            }
            
            // Toggle checkout button
            const checkoutBtn = document.getElementById('checkoutBtn');
            if (checkoutBtn) {
                checkoutBtn.disabled = this.cart.length === 0;
                checkoutBtn.classList.toggle('disabled', this.cart.length === 0);
            }
            
            return { subtotal, shipping: shippingCost, tax, total };
            
        } catch (error) {
            console.error('Error updating summary:', error);
            return { subtotal: 0, shipping: 0, tax: 0, total: 0 };
        }
    }

    // Remove item from cart
    async removeFromCart(itemId) {
        try {
            const response = await fetch(`/api/cart/${this.userId}/items/${itemId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to remove item from cart');
            
            const data = await response.json();
            this.cart = data.items || [];
            this.updateCartCount();
            this.showNotification('Item removed from cart!');
            return true;
        } catch (error) {
            console.error('Error removing from cart:', error);
            this.showNotification('Failed to remove item from cart');
            return false;
        }
    }

    // Update item quantity with validation
    async updateQuantity(id, newQuantity) {
        try {
            const quantity = Math.max(1, parseInt(newQuantity) || 1);
            const item = this.cart.find(item => item.id === id);
            
            if (!item) return;
            
            const response = await fetch(`/api/cart/${this.userId}/items/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity })
            });

            if (!response.ok) throw new Error('Failed to update quantity');
            
            const data = await response.json();
            this.cart = data.items || [];
            this.updateCartCount();
            this.renderCart();
            this.updateSummary();
            
        } catch (error) {
            console.error('Error updating quantity:', error);
            this.showNotification('Failed to update quantity', 'error');
        }
    }

    // Clear cart
    async clearCart() {
        try {
            const response = await fetch(`/api/cart/${this.userId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to clear cart');
            
            this.cart = [];
            this.updateCartCount();
            this.showNotification('Cart cleared!');
            return true;
        } catch (error) {
            console.error('Error clearing cart:', error);
            this.showNotification('Failed to clear cart');
            return false;
        }
    }

    // Get cart total
    getCartTotal() {
        return this.cart.reduce((total, item) => {
            return total + (parseFloat(item.price) * (item.quantity || 1));
        }, 0).toFixed(2);
    }

    // Show notification
    showNotification(message) {
        // You can enhance this with a proper notification library or UI component
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Setup event listeners for cart interactions
    setupEventListeners() {
        // Handle add to cart buttons
        document.addEventListener('click', async (e) => {
            const addToCartBtn = e.target.closest('.add-to-cart, .add-to-cart-btn');
            if (addToCartBtn) {
                e.preventDefault();
                const productCard = addToCartBtn.closest('.product-card, .product, .card');
                if (productCard) {
                    const product = {
                        id: productCard.dataset.productId || Date.now().toString(),
                        name: productCard.querySelector('.product-title, .product-name, .card-title')?.textContent?.trim() || 'Product',
                        price: productCard.querySelector('.price, .product-price')?.textContent?.replace(/[^0-9.]/g, '') || '0',
                        image: productCard.querySelector('img')?.src || ''
                    };
                    
                    // Show loading state
                    const originalText = addToCartBtn.innerHTML;
                    addToCartBtn.disabled = true;
                    addToCartBtn.innerHTML = 'Adding...';
                    
                    // Add to cart
                    const success = await this.addToCart(product);
                    
                    // Show animation if successful
                    if (success) {
                        this.showAddToCartAnimation();
                    }
                    
                    // Reset button state
                    setTimeout(() => {
                        addToCartBtn.innerHTML = originalText;
                        addToCartBtn.disabled = false;
                    }, 1500);
                }
            }
        });
        
        // Handle remove from cart buttons
        document.addEventListener('click', async (e) => {
            const removeFromCartBtn = e.target.closest('.remove-from-cart');
            if (removeFromCartBtn) {
                e.preventDefault();
                const itemId = removeFromCartBtn.dataset.itemId;
                if (itemId) {
                    await this.removeFromCart(itemId);
                    // Optional: Remove the cart item element from the DOM
                    const cartItem = removeToCartBtn.closest('.cart-item, tr[data-item-id]');
                    if (cartItem) {
                        cartItem.style.opacity = '0';
                        setTimeout(() => cartItem.remove(), 300);
                    }
                }
            }
        });
        
        // Handle quantity changes
        document.addEventListener('change', async (e) => {
            const quantityInput = e.target.closest('.quantity-input, input[type="number"]');
            if (quantityInput && quantityInput.closest('.cart-item, tr[data-item-id]')) {
                const itemId = quantityInput.dataset.itemId || quantityInput.closest('[data-item-id]')?.dataset.itemId;
                const newQuantity = parseInt(quantityInput.value, 10);
                if (itemId && !isNaN(newQuantity) && newQuantity > 0) {
                    await this.updateQuantity(itemId, newQuantity);
                } else if (newQuantity <= 0) {
                    // If quantity is set to 0 or negative, remove the item
                    const removeBtn = quantityInput.closest('.cart-item, tr[data-item-id]').querySelector('.remove-from-cart');
                    if (removeBtn) removeBtn.click();
                }
            }
        });
    }
    
    // Show add to cart animation
    showAddToCartAnimation() {
        const animation = document.createElement('div');
        animation.className = 'add-to-cart-animation';
        animation.innerHTML = '✓ Added to Cart';
        document.body.appendChild(animation);
        
        // Trigger animation
        requestAnimationFrame(() => {
            animation.classList.add('show');
        });
                }
            }
        });
    });
}
}

// Initialize cart manager
const cartManager = new CartManager();

// Update cart count when the page loads
document.addEventListener('DOMContentLoaded', function() {
    cartManager.updateCartCount();
});

// Expose to window for easy access in other scripts
window.cartManager = cartManager;
