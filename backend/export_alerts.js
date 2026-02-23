require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const alerts = await prisma.alert.findMany();
        const fs = require('fs');
        fs.writeFileSync('output_alerts.json', JSON.stringify(alerts, null, 2));
        console.log('Wrote', alerts.length, 'alerts to output_alerts.json');
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
