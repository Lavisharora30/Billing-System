//index.js
const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const app = express();

// Connect to your database (e.g., MongoDB)
mongoose.connect('mongodb+srv://lavisharora:lavi2002@bill.lusnpxd.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Middleware for parsing JSON data
app.use(express.json());
// Initialize Passport
app.use(passport.initialize());

// Import and use your user authentication routes
const userRoutes = require('./routes/user');
app.use('/user', userRoutes);
// Use the Products route
const productsRoutes = require('./routes/products');
app.use('/products', productsRoutes);
// Use the Cart route
const cartRoutes = require('./routes/cart');
app.use('/cart', cartRoutes);
// Use the Orders route
const ordersRoutes = require('./routes/orders');
app.use('/orders', ordersRoutes);
// // Use the Admin routes
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
