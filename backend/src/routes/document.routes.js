const express = require("express");
const prisma = require("../config/prisma"); // make sure this path is correct
const generateSignedUrl = require("../services/s3Download.service");

const router = express.Router();

/**
 * GET /api/documents/:documentId
 * Returns a signed download URL for the document
 */
router.get("/:documentId", async (req, res, next) => {
    try {
        const { documentId } = req.params;

        const document = await prisma.document.findUnique({
            where: { documentId }
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "Document not found"
                }
            });
        }

        const signedUrl = await generateSignedUrl(document.filePath);

        res.json({
            success: true,
            documentId: document.documentId,
            fileName: document.fileName,
            url: signedUrl
        });

    } catch (err) {
        console.error("Document download error:", err);
        next(err);
    }
});

module.exports = router;
