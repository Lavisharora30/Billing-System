const bcrypt = require('bcrypt');
const User = require('../models/user');
const Order = require('../models/order');

// Controller function for admin login
async function adminLogin(req, res) {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isAdmin) {
            return res.status(403).json({ message: 'Access denied: Not an admin' });
        }

        const orders = await Order.find();

        return res.status(200).json({ orders });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {
    adminLogin,
};
