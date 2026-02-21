const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
    log: ["error"], // optional: helps debugging
});

module.exports = prisma;
