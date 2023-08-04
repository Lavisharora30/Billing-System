const Product = require('../models/product');

// Controller for fetching all products and services
async function getAllProducts(req, res) {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Controller for adding a new product
async function addProduct(req, res) {
    try {
        const { name, type, price } = req.body;
        const newProduct = new Product({ name, type, price });
        await newProduct.save();
        return res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Controller for fetching a specific product by ID
async function getProductById(req, res) {
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
}

// Controller for updating a product by ID
async function updateProductById(req, res) {
    try {
        const { productId } = req.params;
        const { price } = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(productId, { price }, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Controller for deleting a product by ID
async function deleteProductById(req, res) {
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
}

module.exports = {
    getAllProducts,
    addProduct,
    getProductById,
    updateProductById,
    deleteProductById,
};
