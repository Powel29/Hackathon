const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = require("../config/s3");

const generateSignedUrl = async (key) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    });

    const signedUrl = await getSignedUrl(s3, command, {
        expiresIn: 300, // 5 minutes
    });

    return signedUrl;
};

module.exports = generateSignedUrl;
