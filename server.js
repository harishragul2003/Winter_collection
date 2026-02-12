require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

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

// Handle all routes - serve index.html for non-API routes
app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
    }
    
    // Serve static files
    const filePath = path.join(__dirname, req.path);
    const fs = require('fs');
    
    // Check if file exists
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return res.sendFile(filePath);
    }
    
    // For all other routes, serve index.html
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Winter Collection server running on port ${PORT}`);
    console.log(`📅 Deployment time: ${new Date().toISOString()}`);
});

