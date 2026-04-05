const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Serve raw files
router.get('/files/*', (req, res) => {
    const serveDir = req.app.get('serveDir');
    const filePath = path.resolve(path.join(serveDir, req.path.replace('/files', '')));
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

// Download endpoint
router.get('/download/:filename', (req, res) => {
    const serveDir = req.app.get('serveDir');
    const filePath = path.join(serveDir, req.query.path || '/', req.params.filename);
    fs.existsSync(filePath) ? res.download(filePath) : res.status(404).send('File not found');
});

// Directory browser (catch-all)
router.get('/*', (req, res) => {
    const serveDir = req.app.get('serveDir');
    const encodedPath = decodeURI(req.path);
    const requestedPath = path.join(serveDir, encodedPath);
    const { q: searchQuery, sortBy = 'name', sortOrder = 'asc' } = req.query;

    const renderError = (status, msg) =>
        res.status(status).render('directory', {
            title: 'Error', currentPath: encodedPath,
            parentPath: encodedPath === '/' ? null : path.dirname(encodedPath),
            files: [], error: msg, searchQuery, sortBy, sortOrder,
        });

    if (!fs.existsSync(requestedPath)) return renderError(404, `Not found: ${encodedPath}`);

    const stats = fs.statSync(requestedPath);
    if (stats.isFile()) return res.sendFile(requestedPath);

    fs.readdir(requestedPath, (err, files) => {
        if (err) return renderError(500, err.message);

        let fileList = files
            .filter(f => !f.startsWith('.'))
            .map(file => {
                const fullPath = path.join(requestedPath, file);
                const s = fs.statSync(fullPath);
                return {
                    name: file,
                    path: path.join(req.path, file),
                    isDirectory: s.isDirectory(),
                    size: s.isDirectory() ? null : s.size,
                    modified: s.mtime,
                    lastModified: s.mtime.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
                };
            });

        if (searchQuery) {
            fileList = fileList.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        fileList.sort((a, b) => {
            if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
            let cmp = 0;
            if (sortBy === 'size' && !a.isDirectory) cmp = (a.size || 0) - (b.size || 0);
            else if (sortBy === 'date') cmp = a.modified - b.modified;
            else cmp = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
            return sortOrder === 'desc' ? -cmp : cmp;
        });

        res.render('directory', {
            title: 'File Sharing Network',
            currentPath: encodedPath,
            parentPath: encodedPath === '/' ? null : path.dirname(encodedPath),
            files: fileList,
            error: null,
            searchQuery,
            sortBy,
            sortOrder,
        });
    });
});

module.exports = router;
