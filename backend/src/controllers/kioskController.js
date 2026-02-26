const prisma = require('../utils/prismaClient');

exports.heartbeat = async (req, res) => {
    try {
        const { kioskId, location, printer, network, status } = req.body;

        if (!kioskId) {
            return res.status(400).json({ success: false, message: 'kioskId is required' });
        }

        const kiosk = await prisma.kiosk.upsert({
            where: { id: kioskId },
            update: {
                location: location || 'Unknown',
                printer: printer || 'ok',
                network: network || 'excellent',
                status: status || 'online',
                lastSeen: new Date(),
                updatedAt: new Date()
            },
            create: {
                id: kioskId,
                location: location || 'Unknown',
                printer: printer || 'ok',
                network: network || 'excellent',
                status: status || 'online',
                lastSeen: new Date()
            }
        });

        res.json({ success: true, data: kiosk });
    } catch (error) {
        console.error('Kiosk heartbeat error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

