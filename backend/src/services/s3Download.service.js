const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = require("../config/s3");

const generateSignedUrl = async (key, fileName = null) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    };

    if (fileName) {
        // Forces browser to download file instead of rendering it inline
        // Must encode filename to handle spaces properly
        params.ResponseContentDisposition = `attachment; filename="${encodeURIComponent(fileName)}"`;
    }

    const command = new GetObjectCommand(params);

    const signedUrl = await getSignedUrl(s3, command, {
        expiresIn: 300, // 5 minutes
    });

    return signedUrl;
};

module.exports = generateSignedUrl;
