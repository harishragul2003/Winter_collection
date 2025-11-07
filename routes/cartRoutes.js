const express = require('express');
const router = express.Router();
const Cart = require('../models/cartModel');

// Get user's cart
router.get('/:userId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId });
        if (!cart) {
            return res.status(200).json({ items: [] });
        }
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add item to cart
router.post('/:userId/items', async (req, res) => {
    try {
        const { productId, name, price, quantity = 1, image } = req.body;
        const userId = req.params.userId;

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // Create new cart if it doesn't exist
            cart = new Cart({
                userId,
                items: [{ productId, name, price, quantity, image }]
            });
        } else {
            // Check if item already exists in cart
            const itemIndex = cart.items.findIndex(item => item.productId === productId);
            
            if (itemIndex > -1) {
                // Update quantity if item exists
                cart.items[itemIndex].quantity += quantity;
            } else {
                // Add new item
                cart.items.push({ productId, name, price, quantity, image });
            }
        }

        const updatedCart = await cart.save();
        res.status(201).json(updatedCart);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update cart item quantity
router.patch('/:userId/items/:itemId', async (req, res) => {
    try {
        const { quantity } = req.body;
        const cart = await Cart.findOne({ userId: req.params.userId });
        
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(
            item => item._id.toString() === req.params.itemId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            cart.items.splice(itemIndex, 1);
        } else {
            // Update quantity
            cart.items[itemIndex].quantity = quantity;
        }

        const updatedCart = await cart.save();
        res.json(updatedCart);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Remove item from cart
router.delete('/:userId/items/:itemId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId });
        
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(
            item => item._id.toString() === req.params.itemId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        cart.items.splice(itemIndex, 1);
        const updatedCart = await cart.save();
        res.json(updatedCart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Clear cart
router.delete('/:userId', async (req, res) => {
    try {
        const result = await Cart.deleteOne({ userId: req.params.userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        res.json({ message: 'Cart cleared successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
