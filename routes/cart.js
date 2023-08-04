const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Endpoint to add a product to the user's cart
router.post('/add-to-cart', cartController.addToCart);

// Endpoint to remove a product from the user's cart
router.post('/remove-from-cart', cartController.removeFromCart);

// Endpoint to clear the user's cart
router.post('/clear-cart', cartController.clearCart);

// Route to view cart
router.get('/view-cart/:userId', cartController.viewCart);

// Endpoint to calculate total bill (including taxes) for a user's cart
router.get('/total-bill/:userId', cartController.calculateTotalBill);

module.exports = router;
