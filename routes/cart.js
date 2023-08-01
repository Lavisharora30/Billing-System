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

        let cartPrice = 0;

        // Calculate tax and total value for each item in the cart
        const itemsWithBillDetails = cart.items.map((item) => {
            let totalPrice = 0;
            let taxPercentage = 0;
            let flatTax = 0;

            if (item.product.type === 'product') {
                flatTax = 200;

                if (item.product.price > 1000 && item.product.price <= 5000) {
                    taxPercentage = 0.12;
                    const taxAmount = item.product.price * taxPercentage;
                    const totalValue = item.product.price + taxAmount + flatTax;
                    cartPrice += totalValue;
                    return {
                        item: item.product,
                        price: item.product.price,
                        quantity: item.quantity,
                        PA: taxAmount,
                        PC: flatTax,
                        totalValue: totalValue,
                    };
                } else if (item.product.price > 5000) {
                    taxPercentage = 0.18;
                    const taxAmount = item.product.price * taxPercentage;
                    const totalValue = item.product.price + taxAmount + flatTax;
                    cartPrice += totalValue;
                    return {
                        item: item.product,
                        price: item.product.price,
                        quantity: item.quantity,
                        PB: taxAmount,
                        PC: flatTax,
                        totalValue: totalValue,
                    };
                } else {
                    taxPercentage = 0;
                    const taxAmount = item.product.price * taxPercentage;
                    const totalValue = item.product.price + taxAmount + flatTax;
                    cartPrice += totalValue;
                    return {
                        item: item.product,
                        price: item.product.price,
                        quantity: item.quantity,
                        PC: flatTax,
                        totalValue: totalValue,
                    };
                }
            } else if (item.product.type === 'service') {
                flatTax = 100;
                if (item.product.price > 1000 && item.product.price <= 8000) {
                    taxPercentage = 0.1;
                    const taxAmount = item.product.price * taxPercentage;
                    const totalValue = item.product.price + taxAmount + flatTax;
                    cartPrice += totalValue;
                    return {
                        item: item.product,
                        price: item.product.price,
                        quantity: item.quantity,
                        SA: taxAmount,
                        SC: flatTax,
                        totalValue: totalValue,
                    };
                } else if (item.product.price > 8000) {
                    taxPercentage = 0.15;
                    const taxAmount = item.product.price * taxPercentage;
                    const totalValue = item.product.price + taxAmount + flatTax;
                    cartPrice += totalValue;
                    return {
                        item: item.product,
                        price: item.product.price,
                        quantity: item.quantity,
                        SB: taxAmount,
                        SC: flatTax,
                        totalValue: totalValue,
                    };
                } else {
                    taxPercentage = 0;
                    const taxAmount = item.product.price * taxPercentage;
                    const totalValue = item.product.price + taxAmount + flatTax;
                    cartPrice += totalValue;
                    return {
                        item: item.product,
                        price: item.product.price,
                        quantity: item.quantity,
                        SC: flatTax,
                        totalValue: totalValue,
                    };
                }
            }
        });

        return res.status(200).json({
            items: itemsWithBillDetails,
            CartPrice: cartPrice,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
