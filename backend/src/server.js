const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Strict NODE_ENV validation: require explicit environment
const VALID_ENVS = ['development', 'production', 'test', 'staging'];
if (!process.env.NODE_ENV || !VALID_ENVS.includes(process.env.NODE_ENV)) {
    console.error("FATAL: process.env.NODE_ENV must be set to one of: 'development', 'production', 'test', or 'staging'.");
    process.exit(1);
}

const authRoutes = require('./routes/authRoutes');
const serviceAccountRoutes = require('./routes/serviceAccountRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const billRoutes = require('./routes/billRoutes');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT',
            message: 'Too many requests. Please try again later'
        }
    }
});
app.use(limiter);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/service-accounts', serviceAccountRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/connections', require('./routes/connectionRoutes'));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date(),
        env: process.env.NODE_ENV
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Endpoint not found'
        }
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    res.status(err.status || 500).json({
        success: false,
        error: {
            code: err.code || 'SERVER_ERROR',
            message: err.message || 'Something went wrong'
        }
    });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 SUVIDHA Backend running on port ${PORT}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    });
}

module.exports = app;
// Force restart for connectionController update