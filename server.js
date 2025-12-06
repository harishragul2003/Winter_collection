require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Import routes
const cartRoutes = require('./routes/cartRoutes');

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from the root directory
app.use(express.static(__dirname));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/winter-collection', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/cart', cartRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('build'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

