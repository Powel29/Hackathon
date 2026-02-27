const prisma = require('../src/utils/prismaClient');

afterAll(async () => {
    // Ensure Prisma is disconnected after all test suites finish
    await prisma.$disconnect();
});
