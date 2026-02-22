require('dotenv').config();
const prisma = require('./src/config/prisma');

async function main() {
    try {
        const appId = 'APP-2026-c983dacd3e204957';
        console.log(`Searching for app ${appId}...`);

        const app = await prisma.connectionApplication.findUnique({
            where: { applicationId: appId }
        });

        if (app) {
            console.log("App found with internal ID:", app.id);
            const docs = await prisma.document.findMany({
                where: { relatedId: app.id }
            });
            console.log("Documents by internal ID:", docs.length);
            docs.forEach(d => console.log(' ->', d.documentType, d.fileName));

            const docsByString = await prisma.document.findMany({
                where: { relatedId: appId }
            });
            console.log("Documents by public ID string:", docsByString.length);
        } else {
            console.log("App not found!");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
