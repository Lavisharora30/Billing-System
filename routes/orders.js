const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

// Endpoint to confirm the order
router.post('/confirm-order', ordersController.confirmOrder);

module.exports = router;
