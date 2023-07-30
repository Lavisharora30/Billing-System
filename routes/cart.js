// routes/cart.js
const express = require('express');
const router = express.Router();

const Cart = require('../models/cart');
const Product = require('../models/product');

// Endpoint to add a product to the user's cart
router.post('/add-to-cart', async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        // Check if the product exists in the database
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find the user's cart or create a new one if it doesn't exist
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId });
        }

        // Check if the product is already in the cart
        const existingItem = cart.items.find((item) => item.product.equals(productId));
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        // Save the updated cart to the database
        await cart.save();

        return res.status(200).json({ message: 'Product added to cart successfully', cart });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint to remove a product from the user's cart
router.post('/remove-from-cart', async (req, res) => {
    try {
        const { userId, productId } = req.body;

        // Find the user's cart
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Remove the product from the cart items
        cart.items = cart.items.filter((item) => !item.product.equals(productId));

        // Save the updated cart to the database
        await cart.save();

        return res.status(200).json({ message: 'Product removed from cart successfully', cart });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint to clear the user's cart
router.post('/clear-cart', async (req, res) => {
    try {
        const { userId } = req.body;

        // Find the user's cart
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Clear all items from the cart
        cart.items = [];

        // Save the updated cart to the database
        await cart.save();

        return res.status(200).json({ message: 'Cart cleared successfully', cart });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint to calculate the total bill with taxes
router.get('/total-bill/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find the user's cart
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Calculate taxes and total bill for each item in the cart
        const cartItemsWithTotal = [];
        for (const cartItem of cart.items) {
            const product = await Product.findById(cartItem.product);
            let taxAmount = 0;

            // Calculate tax based on product type and price range
            if (product.type === 'product') {
                if (product.price > 1000 && product.price <= 5000) {
                    taxAmount = product.price * 0.12;
                } else if (product.price > 5000) {
                    taxAmount = product.price * 0.18;
                } else {
                    taxAmount = 0;
                }
            } else if (product.type === 'service') {
                if (product.price > 1000 && product.price <= 8000) {
                    taxAmount = product.price * 0.1;
                } else if (product.price > 8000) {
                    taxAmount = product.price * 0.15;
                } else {
                    taxAmount = 0;
                }
            }

            const totalAmount = product.price + taxAmount;
            cartItemsWithTotal.push({ product, quantity: cartItem.quantity, taxAmount, totalAmount });
        }

        // Calculate the overall total bill for the cart
        const totalBill = cartItemsWithTotal.reduce((acc, item) => acc + item.totalAmount, 0);

        return res.status(200).json({ cartItemsWithTotal, totalBill });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
