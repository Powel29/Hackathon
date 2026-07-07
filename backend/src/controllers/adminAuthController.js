const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prismaClient');

const JWT_SECRET = process.env.ADMIN_JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.trim() === '') {
    throw new Error(
        'FATAL: ADMIN_JWT_SECRET environment variable is not set or is empty. ' +
        'Please configure ADMIN_JWT_SECRET in your .env file for secure admin authentication'
    );
}
const JWT_EXPIRES_IN = '8h';

/**
 * POST /api/admin/login
 * Body: { deptId: string, password: string }
 */
exports.login = async (req, res) => {
    const { deptId, password } = req.body;

    if (!deptId || !password) {
        return res.status(400).json({ success: false, message: 'deptId and password are required' });
    }

    try {
        const admin = await prisma.admin.findUnique({
            where: { departmentId: deptId },
        });

        if (!admin || !admin.isActive) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const passwordValid = await bcrypt.compare(password, admin.passwordHash);
        if (!passwordValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin.id, departmentId: admin.departmentId, department: admin.department, role: admin.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Never send passwordHash to the client
        const { passwordHash, ...user } = admin;

        return res.json({ success: true, token, user });
    } catch (err) {
        console.error('Admin login error details:', err);
        return res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};
/**
 * Middleware: verify admin JWT attached on Authorization header
 * Adds req.admin = { id, departmentId, department, role }
 */
exports.verifyToken = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const token = auth.slice(7);
    try {
        req.admin = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
};
