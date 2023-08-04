const Cart = require('../models/cart');
const Product = require('../models/product');

// Controller function to get the user's cart
async function getCart(userId) {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    return cart;
}

// Controller function to add a product to the user's cart
async function addToCart(req, res) {
    try {
        const { userId, productId, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId });
        }

        const existingItem = cart.items.find((item) => item.product.equals(productId));
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();

        return res.status(200).json({ message: 'Product added to cart successfully', cart });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Controller function to remove a product from the user's cart
async function removeFromCart(req, res) {
    try {
        const { userId, productId } = req.body;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter((item) => !item.product.equals(productId));

        await cart.save();

        return res.status(200).json({ message: 'Product removed from cart successfully', cart });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Controller function to clear the user's cart
async function clearCart(req, res) {
    try {
        const { userId } = req.body;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = [];

        await cart.save();

        return res.status(200).json({ message: 'Cart cleared successfully', cart });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
//Controller function to view cart

async function viewCart(req,res){
    try {
        const userId = req.params.userId;
        const cart = await getCart(userId);
        return res.status(200).json({ cart });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Controller function to calculate total bill (including taxes) for a user's cart
async function calculateTotalBill(req, res) {
    try {
        const { userId } = req.params;

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
}

module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    clearCart,
    viewCart,
    calculateTotalBill,
};
