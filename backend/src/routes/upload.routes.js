const express = require("express");
const multer = require("multer");
const uploadToS3 = require("../services/s3Upload.service");
const prisma = require("../config/prisma");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req, res, next) => {
    try {
        const { citizenId, relatedEntity, relatedId, documentType } = req.body;

        const s3Key = await uploadToS3(req.file);

        const document = await prisma.document.create({
            data: {
                citizenId,
                relatedEntity,
                relatedId,
                documentType,
                fileName: req.file.originalname,
                filePath: s3Key, // store ONLY the key
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
            },
        });

        res.json({
            success: true,
            document,
        });

    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;
