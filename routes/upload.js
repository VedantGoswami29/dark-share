const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 * 1024 }, // 10GB
});

router.post('/upload', upload.array('files', 50), (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (!req.files?.length) {
        return res.status(400).json({ success: false, error: 'No files selected' });
    }

    const serveDir = req.app.get('serveDir');
    const currentPath = req.body.currentPath || '/';
    const targetDir = path.join(serveDir, currentPath);

    const uploaded = [], failed = [];

    try {
        fs.mkdirSync(targetDir, { recursive: true });

        for (const file of req.files) {
            try {
                fs.writeFileSync(path.join(targetDir, file.originalname), file.buffer);
                uploaded.push(file.originalname);
            } catch (e) {
                failed.push({ name: file.originalname, error: e.message });
            }
        }

        return res.json({
            success: true,
            message: `${uploaded.length} file(s) uploaded successfully`,
            uploadedFiles: uploaded,
            failedFiles: failed,
            currentPath,
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            error: `Upload failed: ${e.message}`,
            uploadedFiles: uploaded,
            failedFiles: failed,
        });
    }
});

module.exports = router;
