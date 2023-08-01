// routes/admin.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Order = require('../models/order');

// Admin login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user by username
        const user = await User.findOne({ username });

        // If user not found or password does not match, return an error
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if the user is an admin
        if (!user.isAdmin) {
            return res.status(403).json({ message: 'Access denied: Not an admin' });
        }

        // Generate a JSON Web Token (JWT) upon successful login
        const token = jwt.sign({ userId: user._id, isAdmin: true }, 'your-secret-key', {
            expiresIn: '1h', // Token expiration time (you can customize this)
        });

        // Fetch all orders from the database
        const orders = await Order.find();

        return res.status(200).json({ token, orders });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
