// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Create mock service accounts for testing
    await prisma.serviceAccount.createMany({
        data: [
            {
                citizenId: '378282246310',
                serviceType: 'ELECTRICITY',
                accountNumber: 'ELEC123456',
                status: 'ACTIVE'
            },
            {
                citizenId: '378282246310',
                serviceType: 'WATER',
                accountNumber: 'WAT789012',
                status: 'ACTIVE'
            }
        ]
    });
}

main();