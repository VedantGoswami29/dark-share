# Express.js File Sharing Network

A modern, responsive file sharing application built with Express.js, EJS templates, and Tailwind CSS. Share files seamlessly across devices on your local network with real-time upload progress, file previews, and an intuitive drag-and-drop interface.

## ✨ Features

- 📱 **Fully Responsive Design** - Works perfectly on mobile, tablet, and desktop
- 🎨 **Modern UI** - Clean, professional interface using Tailwind CSS
- 📁 **Smart File Management** - Browse directories, upload to current folder, download files
- 👁️ **File Preview** - Image thumbnails and file type icons in upload menu
- 📊 **Upload Progress** - Real-time progress bar with percentage indicator
- 🎯 **Drag & Drop Upload** - Intuitive file upload with visual feedback
- 👥 **Active Users Tracking** - See who's connected to your network
- 📱 **QR Code Access** - ASCII QR code in terminal + web QR code for mobile
- ⚡ **AJAX Upload** - Non-blocking uploads with instant feedback
- 🔄 **Auto-refresh** - File list updates automatically after uploads

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

3. **Custom Directory (Optional)**
   ```bash
   node app.js /path/to/your/shared/folder
   ```

4. **Access the App**
   - **Local**: `http://localhost:8000`
   - **Network**: Scan the ASCII QR code displayed in terminal
   - **Mobile**: Use the QR code page for easy device connection

## 📂 Project Structure

```
dark-share/
├── app.js                 # Main Express server with enhanced upload handling
├── package.json          # Dependencies and npm scripts
├── README.md            # This documentation
├── views/               # EJS templates with layout system
│   ├── layout.ejs       # Base layout with responsive navbar
│   ├── directory.ejs    # Directory listing with upload form & preview
│   ├── active-users.ejs # Active users dashboard with statistics
│   └── qrcode.ejs       # QR code page with connection info
└── public/              # Static assets
    ├── styles.css       # Custom Tailwind styles + animations
    └── script.js        # Enhanced client-side functionality
```

## 🎯 Key Features Explained

### **File Upload with Preview**
- **Visual Preview**: See image thumbnails before uploading
- **File Information**: File name, size, and type detection
- **Progress Tracking**: Real-time upload progress with percentage
- **Current Directory Upload**: Files upload to the folder you're currently browsing
- **Drag & Drop**: Smooth drag-and-drop with visual feedback

### **Smart File Management**
- **Instant Access**: Uploaded files are immediately accessible
- **Directory Navigation**: Browse nested folders with breadcrumb navigation
- **File Type Detection**: 20+ file types with appropriate icons and colors
- **Responsive Layout**: Grid view on desktop, list view on mobile

### **Network Sharing**
- **Auto IP Detection**: Automatically finds your local network IP
- **ASCII QR Code**: Terminal displays QR code for easy mobile scanning
- **Web QR Code**: In-browser QR code with copy-to-clipboard functionality
- **Active Users**: Real-time tracking of connected devices

## 📱 Pages & Endpoints

| Route | Description | Features |
|-------|-------------|----------|
| `/` | Main directory listing | File browser, upload form with preview, responsive grid/list |
| `/active-users` | Connected devices | User statistics, device list, connection status |
| `/qrcode` | QR code & connection info | Web QR code, connection details, copy URL |
| `/files/*` | Direct file access | Serves files from any directory |
| `/download/:filename` | File downloads | Directory-aware download with proper headers |
| `/upload` | File upload endpoint | AJAX upload with progress tracking |

## 🛠 Installation & Setup

### **Prerequisites**
- Node.js 14+ and npm
- Modern web browser (Chrome 60+, Firefox 60+, Safari 12+, Edge 79+)

### **Step-by-Step Setup**

1. **Clone or Download** the project files
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Start the Server**:
   ```bash
   npm start
   ```
4. **Share with Network**:
   - The ASCII QR code wi# Express.js File Sharing Network

A modern, responsive file sharing application built with Express.js, EJS templates, and Tailwind CSS. Share files seamlessly across devices on your local network.

## Features

- 📱 **Fully Responsive Design** - Works perfectly on mobile, tablet, and desktop
- 🎨 **Modern UI** - Clean, professional interface using Tailwind CSS
- 📁 **File Management** - Browse directories, upload, and download files
- 👥 **Active Users Tracking** - See who's connected to your network
- 📱 **QR Code Access** - Quick connection via QR code (displayed in terminal)
- 🔄 **Drag & Drop Upload** - Intuitive file upload experience
- ⚡ **Fast & Lightweight** - Minimal dependencies, maximum performance

## Project Structure

```
├── app.js                 # Main Express server
├── package.json          # Dependencies and scripts
├── README.md            # This file
├── views/               # EJS templates
│   ├── layout.ejs       # Base layout with navbar
│   ├── directory.ejs    # Directory listing page
│   ├── active-users.ejs # Active users page
│   └── qrcode.ejs       # QR code page
└── public/              # Static assets
    ├── styles.css       # Custom Tailwind styles
    └── script.js        # Client-side JavaScript
```

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

3. **Specify Custom Directory (Optional)**
   ```bash
   node app.js /path/to/your/directory
   ```

## Usage

1. **Start the server** - Run `npm start` and the ASCII QR code will be displayed in your terminal
2. **Access locally** - Open `http://localhost:8000` in your browser
3. **Share with others** - Other devices on the same network can scan the QR code or visit the displayed IP address
4. **Upload files** - Use the drag-and-drop upload area or click to select files
5. **Browse files** - Click folders to navigate, download files directly

## Pages

- **`/`** - Main directory listing with upload functionality
- **`/active-users`** - View all connected devices
- **`/qrcode`** - QR code and connection information
- **`/download/:filename`** - Direct file download endpoint

## Technical Details

### Dependencies

- **express** - Web framework
- **ejs** - Template engine
- **express-ejs-layouts** - Layout support for EJS
- **multer** - File upload handling
- **qrcode** - QR code generation

### Styling

- **Tailwind CSS** - Utility-first CSS framework loaded via CDN
- **Custom CSS** - Additional animations and responsive tweaks
- **SVG Icons** - Inline SVG icons for better performance

### Features

- **Responsive Design** - Mobile-first approach with breakpoints for tablet and desktop
- **Modern UX** - Smooth animations, hover effects, and loading states
- **Accessibility** - Proper ARIA labels, keyboard navigation, and focus management
- **Cross-browser Compatibility** - Works on all modern browsers

## Network Access

The application automatically detects your local IP address and displays:
- **Terminal QR Code** - ASCII QR code for easy mobile access
- **Connection URLs** - Both local and network URLs
- **Active Users** - Real-time tracking of connected devices

## Security Notes

- This application is designed for **local network use only**
- No authentication is implemented - suitable for trusted networks
- Files are served directly from the filesystem
- Consider network security when sharing on public networks

## Customization

### Styling
Modify `public/styles.css` to customize:
- Color schemes
- Animations
- Responsive breakpoints
- Custom components

### Templates
Edit EJS templates in `views/` to customize:
- Layout structure
- Page content
- Navigation elements

### Functionality
Extend `app.js` to add:
- Authentication
- File encryption
- Advanced upload features
- User management

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
