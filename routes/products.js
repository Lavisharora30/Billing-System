const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');

// Endpoint to fetch all products and services
router.get('/products', productsController.getAllProducts);

// Endpoint to add a new product
router.post('/products', productsController.addProduct);

// Route to fetch a specific product by ID
router.get('/products/:productId', productsController.getProductById);

// Route to update a product by ID
router.patch('/products/:productId', productsController.updateProductById);

// Route to delete a product by ID
router.delete('/products/:productId', productsController.deleteProductById);

module.exports = router;
