const jwt = require('jsonwebtoken');
const prisma = require('../utils/prismaClient');

/**
 * Verify JWT Token
 */
exports.verifyToken = async (req, res, next) => {
    try {
        if (req.method === 'OPTIONS') {
            return next();
        }
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'NO_TOKEN',
                    message: 'Authentication required'
                }
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if session is still active
        const session = await prisma.authSession.findFirst({
            where: {
                citizenId: decoded.citizenId,
                isActive: true,
                expiresAt: { gte: new Date() }
            }
        });

        if (!session) {
            console.log('❌ Session not found or expired for citizen:', decoded.citizenId);
            return res.status(401).json({
                success: false,
                error: {
                    code: 'SESSION_EXPIRED',
                    message: 'Session has expired. Please login again'
                }
            });
        }

        // Update last activity
        await prisma.authSession.update({
            where: { sessionId: session.sessionId },
            data: { lastActivityAt: new Date() }
        });

        // Attach user to request
        req.user = decoded;
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'TOKEN_EXPIRED',
                    message: 'Token has expired. Please login again'
                }
            });
        }

        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Invalid authentication token'
            }
        });
    }
};

/**
 * Logout
 */
exports.logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];

        if (token) {
            const decoded = jwt.decode(token);

            if (!decoded || !decoded.citizenId) {
                return res.json({
                    success: true,
                    message: 'Logged out successfully'
                });
            }

            // Deactivate all sessions for this citizen
            await prisma.authSession.updateMany({
                where: {
                    citizenId: decoded.citizenId,
                    isActive: true
                },
                data: { isActive: false }
            });
        }
        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: {
                code: 'LOGOUT_ERROR',
                message: 'Error logging out'
            }
        });
    }
};
