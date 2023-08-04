const Cart = require('../models/cart');
const Product = require('../models/product');
const Order = require('../models/order');

// Controller function to calculate total bill with taxes
async function calculateTotalBill(cartItems) {
    let totalBill = 0;
    for (const cartItem of cartItems) {
        const product = await Product.findById(cartItem.product);
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

    return totalBill;
}

// Controller function to confirm the order
async function confirmOrder(req, res) {
    try {
        const { userId } = req.body;

        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(404).json({ message: 'Cart is empty. Cannot confirm the order.' });
        }

        const totalBill = await calculateTotalBill(cart.items);

        const newOrder = new Order({
            user: userId,
            items: cart.items,
            totalBill,
        });

        await newOrder.save();

        cart.items = [];
        await cart.save();

        return res.status(200).json({ message: 'Order confirmed successfully', order: newOrder });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {
    confirmOrder,
};
