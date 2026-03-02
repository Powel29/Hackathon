require('dotenv').config({ path: 'd:/Powel/Hackathon/Hackathon/backend/.env' });
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    }
});

async function run() {
    try {
        console.log("Testing with:");
        console.log("Region:", process.env.AWS_REGION);
        console.log("Access Key:", process.env.AWS_ACCESS_KEY?.slice(0, 5) + "...");
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: 'documents/111122223333/municipal/SUPPORTING_DOCUMENT_1772386001640_WhatsApp Image 2026-03-01 at 4.16.18 PM.jpeg'
        });
        const response = await s3.send(command);
        console.log("SUCCESS. Status Code:", response.$metadata.httpStatusCode);
    } catch (e) {
        console.error("ERROR:");
        console.error("Code:", e.name);
        console.error("Message:", e.message);
    }
}

run();
