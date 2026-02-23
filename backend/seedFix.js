const prisma = require('./src/config/prisma');

async function seedData() {
    console.log("Seeding Database...");

    try {
        // 1. Ensure Citizen Exists
        const citizen = await prisma.citizen.upsert({
            where: { aadharNumber: '111122223333' },
            update: {},
            create: {
                aadharNumber: '111122223333',
                fullName: 'John Doe',
                mobileNumber: '9999999999',
                aadharHash: 'mockedHash1234567890'
            }
        });
        console.log("Citizen Ready:", citizen.aadharNumber);

        // 2. Ensure Electricity Account matches screenshot
        const crypto = require('crypto');
        const account = await prisma.electricityAccount.upsert({
            where: { consumerNumber: 'ELEC-DL-2024-001234' },
            update: {
                status: 'ACTIVE', // CRITICAL FIX: Status must be ACTIVE
                citizenId: '111122223333'
            },
            create: {
                accountId: "500ff797-f5a5-49c7-9303-424198470c2e",
                consumerNumber: 'ELEC-DL-2024-001234',
                citizenId: '111122223333',
                connectionType: 'house',
                sanctionedLoad: '5 kW',
                status: 'ACTIVE', // CRITICAL FIX
                lastReadingDate: new Date(),
                updatedAt: new Date()
            }
        });

        console.log("Electricity Account Prepared successfully:", account.consumerNumber);

    } catch (err) {
        console.error("Error Seeding Data:", err);
    } finally {
        await prisma.$disconnect();
    }
}

seedData();
