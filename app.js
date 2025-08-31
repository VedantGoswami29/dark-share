// Required Modules
const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const multer = require('multer');
const qr = require('qrcode');
const app = express();
const activeUsers = new Set();
const PORT = 8000;

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configure EJS layout
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'layout');

// Helper function for file size formatting
app.locals.formatFileSize = function(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Get Local Area Network IP
const localIP = () => {
    const interfaces = os.networkInterfaces();
    for (let iface of Object.values(interfaces)) {
        for (let config of iface) {
            if (config.family === 'IPv4' && !config.internal) {
                return config.address;
            }
        }
    }
    return 'localhost';
};

// Serve Static Files
const serveDir = process.argv[2] || __dirname;
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve files from the target directory with proper routing
app.get('/files/*', (req, res) => {
    const filePath = decodeURI(path.resolve(path.join(serveDir, req.path.replace('/files', ''))));
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

app.get('/download/:filename', (req, res) => {
    // Support downloads from current directory path
    const currentPath = req.query.path || '/';
    const filePath = path.join(serveDir, currentPath, req.params.filename);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

app.use(express.urlencoded({ extended: true }));

// Configure Multer for File Uploads
const upload = multer({ storage: multer.memoryStorage() });

// Display QR Code (no longer renders HTML)
app.get('/qrcode', (req, res) => {
    const url = `http://${localIP()}:${PORT}`;
    res.render('qrcode', { 
        title: 'QR Code', 
        url: url,
        ip: localIP(),
        port: PORT
    });
});

// Track Active Users
app.use((req, res, next) => {
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    activeUsers.add(clientIP);
    next();
});

// Display Active Users
app.get('/active-users', (req, res) => {
    const userArray = Array.from(activeUsers);
    res.render('active-users', { 
        title: 'Active Users', 
        users: userArray 
    });
});

// Directory Listing and Upload Form
app.get('/*', (req, res) => {
    const encodedPath = decodeURI(req.path);
    const requestedPath = path.join(serveDir, encodedPath);

    if (!fs.existsSync(requestedPath)) {
        return res.status(404).render('directory', {
            title: 'File Not Found',
            currentPath: encodedPath,
            parentPath: encodedPath === '/' ? null : path.dirname(encodedPath),
            files: [],
            error: `No such file or directory ${encodedPath}`
        });
    }

    const stats = fs.statSync(requestedPath);
    
    // If it's a file, serve it directly
    if (stats.isFile()) {
        return res.sendFile(requestedPath);
    }

    // If it's a directory, list contents
    fs.readdir(requestedPath, (err, files) => {
        if (err) {
            return res.status(500).render('directory', {
                title: 'Error',
                currentPath: encodedPath,
                parentPath: encodedPath === '/' ? null : path.dirname(encodedPath),
                files: [],
                error: `Error: ${err.message}`
            });
        }

        const fileList = files
            .filter(file => !file.startsWith('.'))
            .map(file => {
                const filePath = path.join(req.path, file);
                const fullPath = path.join(requestedPath, file);
                const isDirectory = fs.statSync(fullPath).isDirectory();
                const stats = fs.statSync(fullPath);
                
                return {
                    name: file,
                    path: filePath,
                    isDirectory: isDirectory,
                    size: isDirectory ? null : stats.size,
                    modified: stats.mtime
                };
            });

        // Calculate parent directory
        const parentPath = encodedPath === '/' ? null : path.dirname(encodedPath);

        res.render('directory', {
            title: 'File Sharing Network',
            currentPath: encodedPath,
            parentPath: parentPath,
            files: fileList,
            error: null
        });
    });
});

// Handle File Uploads
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ 
            success: false, 
            error: 'No file selected for upload' 
        });
    }

    // Get the current directory from the referer or form data
    const currentPath = req.body.currentPath || '/';
    const targetDir = path.join(serveDir, currentPath);
    const uploadPath = path.join(targetDir, req.file.originalname);
    
    try {
        // Ensure target directory exists
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        
        fs.writeFileSync(uploadPath, req.file.buffer);
        
        // Return JSON response for AJAX handling
        res.json({ 
            success: true, 
            message: `File "${req.file.originalname}" uploaded successfully`,
            fileName: req.file.originalname,
            currentPath: currentPath
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: `Upload failed: ${error.message}` 
        });
    }
});

// Generate ASCII QR Code for terminal
const generateTerminalQR = async () => {
    const url = `http://${localIP()}:${PORT}`;
    try {
        const qrString = await qr.toString(url, { type: 'terminal' });
        console.log('\n' + '='.repeat(50));
        console.log('📱 SCAN QR CODE TO CONNECT:');
        console.log('='.repeat(50));
        console.log(qrString);
        console.log('='.repeat(50));
        console.log(`🌐 Server URL: ${url}`);
        console.log('='.repeat(50) + '\n');
    } catch (err) {
        console.log(`Server running at: http://${localIP()}:${PORT}`);
    }
};

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 File Sharing Server started!`);
    console.log(`📂 Serving directory: ${serveDir}`);
    console.log(`🌍 Local network access: http://${localIP()}:${PORT}`);
    console.log(`💻 Local access: http://localhost:${PORT}`);
    
    // Generate and display ASCII QR code in terminal
    generateTerminalQR();
});