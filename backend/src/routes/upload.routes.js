const express = require("express");
const multer = require("multer");
const uploadToS3 = require("../services/s3Upload.service");
const prisma = require("../config/prisma");

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB limit
    },
});

router.post("/", (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error("❌ [Upload Route] Multer Error:", err);
            return res.status(400).json({ success: false, error: "File too large", details: err.message });
        } else if (err) {
            console.error("❌ [Upload Route] Unknown Upload Error:", err);
            return res.status(400).json({ success: false, error: "Upload error", details: err.message });
        }
        next();
    });
}, async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No file uploaded" });
        }

        const { citizenId, relatedEntity, relatedId, documentType, department } = req.body;

        // Validation
        if (!citizenId || !relatedEntity || !relatedId || !documentType) {
            console.error("❌ [Upload Route] Missing required fields:", { citizenId, relatedEntity, relatedId, documentType });
            return res.status(400).json({
                success: false,
                error: "Missing required metadata",
                details: "citizenId, relatedEntity, relatedId, and documentType are required"
            });
        }

        console.log("🚀 [Upload Route] Starting S3 upload for:", req.file.originalname);
        const s3Key = await uploadToS3(req.file, { citizenId, relatedEntity, documentType, department });
        console.log("✅ [Upload Route] S3 upload complete, key:", s3Key);

        console.log("📝 [Upload Route] Creating Prisma document record...");

        const document = await prisma.document.create({
            data: {
                citizenId,
                department,
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
        console.error("❌ [Upload Route] Error during file upload:");
        console.error("Request Body:", req.body);
        console.error("File Info:", req.file ? { name: req.file.originalname, size: req.file.size } : "No file");
        console.error(err.stack);
        res.status(500).json({
            success: false,
            error: "Internal Server Error during upload",
            details: err.message
        });
    }
});

module.exports = router;
