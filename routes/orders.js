// routes/orders.js
const express = require('express');
const router = express.Router();

const Order = require('../models/order');
const Product = require('../models/product');
const Cart = require('../models/cart');

// Endpoint to confirm the order
router.post('/confirm-order', async (req, res) => {
    try {
        const { userId } = req.body;

        // Find the user's cart
        const cart = await Cart.findOne({ user: userId });
        if (!cart || cart.items.length === 0) {
            return res.status(404).json({ message: 'Cart is empty. Cannot confirm the order.' });
        }

        // Calculate the total bill for the cart with taxes
        let totalBill = 0;
        for (const cartItem of cart.items) {
            const product = await Product.findById(cartItem.product);
            if (!product) {
                return res.status(404).json({ message: 'Product not found in the database' });
            }

            let taxAmount = 0;

            // Calculate tax based on product type and price range
            if (product.type === 'product') {
                if (product.price > 1000 && product.price <= 5000) {
                    taxAmount = product.price * 0.12;
                } else if (product.price > 5000) {
                    taxAmount = product.price * 0.18;
                }
            } else if (product.type === 'service') {
                if (product.price > 1000 && product.price <= 8000) {
                    taxAmount = product.price * 0.1;
                } else if (product.price > 8000) {
                    taxAmount = product.price * 0.15;
                }
            }

            const totalAmount = product.price + taxAmount;
            totalBill += totalAmount * cartItem.quantity;
        }

        // Create a new order instance
        const newOrder = new Order({
            user: userId,
            items: cart.items,
            totalBill,
        });

        // Save the order to the database
        await newOrder.save();

        // Clear the user's cart after confirming the order
        cart.items = [];
        await cart.save();

        return res.status(200).json({ message: 'Order confirmed successfully', order: newOrder });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
