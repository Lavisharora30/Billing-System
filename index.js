const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const app = express();

// Connect to your database (e.g., MongoDB)
mongoose.connect('mongodb+srv://lavisharora3019:shub1997@cluster0.bhjwzoy.mongodb.net/?retryWrites=true&w=majority', {
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




// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
