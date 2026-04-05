# File Sharing Network

A fast, zero-configuration LAN file sharing server. Browse, upload, and download files from any device on your local network via a web browser.

## Features

- 📂 Browse directories with grid/list views
- ⬆️ Upload multiple files with drag-and-drop and progress tracking
- ⬇️ Download any file
- 🔍 Search and sort files by name, size, or date
- 📱 QR code for quick mobile access
- 👥 Active user tracking
- 🖼️ File type icons (images, video, audio, code, documents, archives, and more)
- 📷 Inline image previews in the file browser

## Quick Start

```bash
npm install
node app.js [directory] [port]
```

**Examples:**
```bash
node app.js                        # Serve current directory on port 8000
node app.js /home/user/files       # Serve a specific directory on port 8000
node app.js /home/user/files 3000  # Serve on a custom port
```

On startup, a QR code is printed in the terminal. Scan it with your phone (on the same Wi-Fi) to connect instantly.

## Project Structure

```
├── app.js                    # Entry point — server bootstrap
├── routes/
│   ├── files.js              # Directory browser, file serving, downloads
│   ├── upload.js             # File upload handler (multi-file, up to 10GB each)
│   └── info.js               # QR code and active users pages
├── middleware/
│   ├── security.js           # HTTP security headers
│   └── trackUsers.js         # Tracks connected IPs
├── utils/
│   ├── network.js            # LAN IP detection, terminal QR generation
│   └── files.js              # File size formatting, file type detection
├── public/
│   ├── script.js             # Client-side JS (upload, drag-drop, UI)
│   └── styles.css            # Tailwind + custom styles
└── views/
    ├── layout.ejs            # Base HTML layout with navigation
    ├── directory.ejs         # File browser view
    ├── qrcode.ejs            # QR code page
    ├── active-users.ejs      # Connected users page
    └── partials/
        └── file-icon.ejs     # File type SVG icons
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/*` | Browse directory or serve file |
| GET | `/files/*` | Serve a raw file |
| GET | `/download/:filename?path=` | Force-download a file |
| POST | `/upload` | Upload files (multipart/form-data) |
| GET | `/qrcode` | QR code page |
| GET | `/active-users` | Connected users list |

## Requirements

- Node.js 18+
- npm

## Dependencies

| Package | Purpose |
|---------|---------|
| express | HTTP server |
| express-ejs-layouts | Layout wrapper for EJS views |
| ejs | Server-side templating |
| multer | Multipart file upload parsing |
| qrcode | Terminal + browser QR code generation |
