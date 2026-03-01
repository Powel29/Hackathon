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
const connectionRoutes = require('./routes/connectionRoutes');
const uploadRoutes = require('./routes/upload.routes');
const downloadRoutes = require('./routes/download.routes');
const documentRoutes = require('./routes/document.routes');
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// Trust proxy to allow express-rate-limit to accurately identify users
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://maps.googleapis.com"],
            connectSrc: [
                "'self'",
                "http://localhost:*",
                "https://nextgen-seva-backend.onrender.com",
                "https://nextgen-seva-chatbot-backend.onrender.com",
                "https://maps.googleapis.com",
                "https://*.googleapis.com"
            ],
            imgSrc: ["'self'", "data:", "https://*.googleapis.com", "https://*.gstatic.com", "https://maps.gstatic.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
    origin: [
        // Production URLs
        'https://nextgensevafrontend.vercel.app',
        'https://nextgensevaadmin.vercel.app',
        'https://nextgen-seva-backend.onrender.com',
        'https://nextgen-seva-chatbot-backend.onrender.com',
        'https://nextgensevachatbotfrontend.vercel.app',
        // Local development
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        // Env override
        process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true
}));

// 🔥 THIS IS VERY IMPORTANT
app.options('*', cors());


// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Routes that should NOT be rate limited strictly (System/Hardware health)
app.use('/api/kiosks', require('./routes/kioskRoutes'));

// Rate Limiting (Applied to all other regular user routes)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Increased from 100 to support high kiosk activity
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT',
            message: 'Too many requests. Please try again later'
        }
    }
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/service-accounts', serviceAccountRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/service-requests', require('./routes/serviceRequestRoutes'));
app.use('/api/connections', require('./routes/connectionRoutes'));
app.use('/api/upload', uploadRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/documents', documentRoutes);
app.use("/api/payment", paymentRoutes);

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
    console.error('!!!!!!!!!!!!!!!!!!!!! ERROR CAUGHT !!!!!!!!!!!!!!!!!!!!!');
    console.error('Path:', req.path);
    console.error('Method:', req.method);
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');

    res.status(err.status || 500).json({
        success: false,
        error: {
            code: err.code || 'SERVER_ERROR',
            message: err.message || 'Something went wrong',
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }
    });
});

const PORT = process.env.PORT || 5001;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 NextGen Seva Backend running on port ${PORT}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    });
}

module.exports = app;
// Force restart for connectionController update
