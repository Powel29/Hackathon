const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function test() {
    try {
        const documents = await prisma.document.findMany({
            where: { citizenId: "111122223333" },
            orderBy: { uploadedAt: "desc" },
        });
        console.log("Documents:", documents);
    } catch (error) {
        console.error("Query failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
