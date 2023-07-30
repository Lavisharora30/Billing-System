// routes/cart.js
const express = require('express');
const router = express.Router();

const Cart = require('../models/cart');
const Product = require('../models/product');

// Function to get the user's cart
async function getCart(userId) {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    return cart;
}

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

// Route to view cart
router.get('/view-cart/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const cart = await getCart(userId);
        return res.status(200).json({ cart });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Endpoint to calculate total bill (including taxes) for a user's cart
router.get('/total-bill/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the user's cart
        const cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const totalBill = {
            items: [],
            totalValue: 0,
        };

        // Calculate total value of selected items
        for (const item of cart.items) {
            const product = item.product;
            const price = product.price;
            const quantity = item.quantity;

            let tax = 0;
            if (product.type === 'product') {
                if (price > 1000 && price <= 5000) {
                    tax = price * 0.12;
                } else if (price > 5000) {
                    tax = price * 0.18;
                }
            } else if (product.type === 'service') {
                if (price > 1000 && price <= 8000) {
                    tax = price * 0.1;
                } else if (price > 8000) {
                    tax = price * 0.15;
                }
            }

            const totalItemValue = price * quantity + tax;

            totalBill.items.push({
                product: product.name,
                price,
                quantity,
                tax,
                totalItemValue,
            });

            totalBill.totalValue += totalItemValue;
        }

        return res.status(200).json(totalBill);
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
