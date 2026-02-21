const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3");

const uploadToS3 = async (file) => {
    const key = `documents/${Date.now()}-${file.originalname}`;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(params));

    // Return ONLY the key
    return key;
};

module.exports = uploadToS3;
