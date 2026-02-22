const fs = require('fs');
require('dotenv').config();
const prisma = require('./src/config/prisma');

async function main() {
    try {
        const appId = 'APP-2026-c983dacd3e204957';
        const app = await prisma.connectionApplication.findUnique({
            where: { applicationId: appId }
        });

        if (app) {
            const docs = await prisma.document.findMany({
                where: { relatedId: app.id }
            });
            fs.writeFileSync('docs-output.json', JSON.stringify(docs, null, 2));
        } else {
            fs.writeFileSync('docs-output.json', JSON.stringify({ error: "App not found" }));
        }
    } catch (e) {
        fs.writeFileSync('docs-output.json', JSON.stringify({ error: e.message }));
    } finally {
        await prisma.$disconnect();
    }
}
main();
