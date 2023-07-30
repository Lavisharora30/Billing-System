// routes/products.js
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

// Route to fetch a specific product by ID
router.get('/products/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.status(200).json({ product });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route to update a product by ID
router.patch('/products/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const { price } = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { price },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route to delete a product by ID
router.delete('/products/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
