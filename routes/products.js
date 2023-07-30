
const express = require('express');
const router = express.Router();

const Product = require('../models/product');

// Endpoint to fetch all products and services
router.get('/products', async (req, res) => {
    try {
        // Fetch all products and services from the database
        const products = await Product.find();

        res.json(products);
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint to add a new product
router.post('/products', async (req, res) => {
    try {
        const { name, type, price } = req.body;

        // Create a new product instance
        const newProduct = new Product({
            name,
            type,
            price,
        });

        // Save the product to the database
        await newProduct.save();

        return res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
