const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const billRoutes = require('./routes/billRoutes');
<<<<<<< Updated upstream
const paymentRoutes = require('./routes/paymentRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
=======
const uploadRoutes = require('./routes/upload.routes');
const downloadRoutes = require('./routes/download.routes');
const documentRoutes = require('./routes/document.routes');
>>>>>>> Stashed changes

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bills', billRoutes);
<<<<<<< Updated upstream
app.use('/api/payments', paymentRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/connections', connectionRoutes);
=======
app.use('/api/connections', require('./routes/connectionRoutes'));
app.use('/api/upload', uploadRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/documents', documentRoutes);
>>>>>>> Stashed changes

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

<<<<<<< Updated upstream
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
=======
const PORT = process.env.PORT || 7001;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 SUVIDHA Backend running on port ${PORT}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    });
}

module.exports = app;
// Force restart for connectionController update
>>>>>>> Stashed changes
