const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

const { localIP, generateTerminalQR } = require('./utils/network');
const { formatFileSize } = require('./utils/files');
const securityMiddleware = require('./middleware/security');
const trackUsers = require('./middleware/trackUsers');

const filesRouter = require('./routes/files');
const uploadRouter = require('./routes/upload');
const infoRouter = require('./routes/info');

const app = express();
const PORT = process.argv[3] || 8000;
const SERVE_DIR = process.argv[2] || __dirname;

// Make available to routes
app.set('serveDir', SERVE_DIR);
app.set('port', PORT);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Template helpers
app.locals.formatFileSize = formatFileSize;

// Middleware
app.use(securityMiddleware);
app.use(trackUsers);
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', infoRouter);
app.use('/', uploadRouter);
app.use('/', filesRouter);

app.listen(PORT, '0.0.0.0', () => {
    const ip = localIP();
    console.log(`🚀 File Sharing Server started!`);
    console.log(`📂 Serving: ${SERVE_DIR}`);
    console.log(`🌍 LAN: http://${ip}:${PORT}`);
    console.log(`💻 Local: http://localhost:${PORT}`);
    generateTerminalQR(`http://${ip}:${PORT}`);
});
