const express = require('express');
const router = express.Router();
const { localIP } = require('../utils/network');

router.get('/qrcode', (req, res) => {
    const ip = localIP();
    const port = req.app.get('port');
    res.render('qrcode', {
        title: 'QR Code',
        url: `http://${ip}:${port}`,
        ip,
        port,
    });
});

router.get('/active-users', (req, res) => {
    res.render('active-users', {
        title: 'Active Users',
        users: Array.from(req.activeUsers),
    });
});

module.exports = router;
