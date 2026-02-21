const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3");

const uploadToS3 = async (file, metadata = {}) => {
    const { citizenId, relatedEntity, documentType, department } = metadata;

    // Construct hierarchical key if metadata is provided, otherwise fallback to flat documents folder
    let key;
    if (citizenId && department && documentType) {
        key = `documents/${citizenId}/${department}/${documentType}_${Date.now()}_${file.originalname}`;
    } else if (citizenId && relatedEntity && documentType) {
        key = `documents/${citizenId}/${relatedEntity}/${documentType}_${Date.now()}_${file.originalname}`;
    } else {
        key = `documents/${Date.now()}-${file.originalname}`;
    }

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
