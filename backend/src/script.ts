import 'dotenv/config';
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    try {
        await prisma.$connect();
        console.log("Successfully connected to the database");
        const existing = await prisma.citizen.findUnique({
            where: { aadharNumber: '123456789012' }
        });

        if (existing) {
            console.log("Citizen already exists:", existing);
        } else {
            const citizen = await prisma.citizen.create({
                data: {
                    aadharNumber: '123456789012',
                    aadharHash: 'test-hash-123456789012',
                    fullName: 'John Doe',
                    mobileNumber: '1234567890',
                    email: 'john.doe@example.com',
                    languagePref: 'en',
                },
            });
            console.log("Created citizen:", citizen);
        }
    } catch (e: any) {
        console.error("Connection Error:", e.message);
        if (e.cause) console.error("Cause:", e.cause);
    } finally {
        await prisma.$disconnect();
    }
}

main();

console.log("Script Started")
console.log("DATABASE_URL =", process.env.DATABASE_URL);