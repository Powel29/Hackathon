const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function main() {
    console.log('🌱 Seeding Electricity Data...');

    // 1. Get or Create a Demo Citizen
    const citizen = await prisma.citizen.upsert({
        where: { aadharNumber: '123456789012' },
        update: {},
        create: {
            aadharNumber: '123456789012',
            aadharHash: 'hash_demo_123',
            fullName: 'Rahul Sharma',
            mobileNumber: '9876543210',
            address: 'Flat 101, Galaxy Apartments, Cyber City',
            gender: 'Male',
            dateOfBirth: new Date('1990-01-01'),
            isActive: true,
            isVerified: true
        }
    });

    console.log(`👤 Citizen ensured: ${citizen.fullName}`);

    // UUIDs for accounts
    const serviceAccountId = '11111111-1111-1111-1111-111111111111';
    const electricityAccountId = '22222222-2222-2222-2222-222222222222';

    // 2. Create Service Account (Generic)
    const serviceAccount = await prisma.serviceAccount.upsert({
        where: { accountId: serviceAccountId },
        update: {},
        create: {
            accountId: serviceAccountId,
            citizenId: citizen.aadharNumber,
            serviceType: 'ELECTRICITY',
            accountNumber: '100200300400',
            status: 'ACTIVE'
        }
    });

    // 3. Create Electricity Account (Specific)
    const electricityAccount = await prisma.electricityAccount.upsert({
        where: { citizenId: citizen.aadharNumber },
        update: {},
        create: {
            accountId: electricityAccountId,
            citizenId: citizen.aadharNumber,
            consumerNumber: '100200300400',
            connectionType: 'Residential',
            sanctionedLoad: '5 kW',
            status: 'ACTIVE',
            currentMonthUsage: 145.5,
            dailyAverage: 7.2,
            peakLoad: 3.8,
            lastBillAmount: 1250.00,
            lastReadingDate: new Date(),
            updatedAt: new Date()
        }
    });

    console.log(`⚡ Electricity Account ensured: ${electricityAccount.consumerNumber}`);

    // 4. Create Bills
    const months = [0, 1, 2];
    for (const i of months) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);

        // Use deterministic UUIDs but valid format
        // We can't easily generate deterministic UUIDs with crypto without a lib, 
        // so we'll just use random ones BUT we need to upsert.
        // Upsert requires a unique field. `billId` is unique.
        // We can use a consistent UUID string pattern.
        const billId = `33333333-3333-3333-3333-33333333330${i}`;

        // 1. Generic Bill
        await prisma.bill.upsert({
            where: { billId },
            update: {},
            create: {
                billId,
                accountId: serviceAccount.accountId,
                billingDate: date,
                billingPeriod: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
                amount: 1200 + (i * 100),
                dueDate: new Date(date.getTime() + 15 * 24 * 60 * 60 * 1000),
                status: i === 0 ? 'PENDING' : 'PAID'
            }
        });

        // 2. Specific Electricity Bill Details
        await prisma.electricityBill.upsert({
            where: { billId },
            update: {},
            create: {
                billId,
                accountId: electricityAccount.accountId,
                billNumber: `EB-2026-${100 + i}`,
                billingPeriod: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
                billingStartDate: new Date(date.getFullYear(), date.getMonth(), 1),
                billingEndDate: new Date(date.getFullYear(), date.getMonth() + 1, 0),
                unitsConsumed: 150 + (i * 10),
                previousReading: 1000 + (i * 150),
                currentReading: 1150 + (i * 150),
                energyCharges: 1000,
                fixedCharges: 200,
                taxAmount: 100 + (i * 10),
                totalAmount: 1200 + (i * 100),
                dueDate: new Date(date.getTime() + 15 * 24 * 60 * 60 * 1000),
                status: i === 0 ? 'PENDING' : 'PAID'
            }
        });
    }

    console.log('✅ Seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
