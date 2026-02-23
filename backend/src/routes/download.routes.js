const express = require("express");
const generateSignedUrl = require("../services/s3Download.service");

const router = express.Router();

router.get("/:key", async (req, res, next) => {
    try {
        const key = `documents/${req.params.key}`;

        const url = await generateSignedUrl(key, req.query.filename || null);

        res.json({ url });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
