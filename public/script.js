// Enhanced file upload with preview and progress
document.addEventListener('DOMContentLoaded', function () {
    // File upload functionality
    const fileInput = document.getElementById('file');
    const uploadArea = document.getElementById('upload-area');
    const uploadForm = document.getElementById('upload-form');
    const filePreview = document.getElementById('file-preview');
    const previewThumbnail = document.getElementById('preview-thumbnail');
    const previewFilename = document.getElementById('preview-filename');
    const previewFilesize = document.getElementById('preview-filesize');
    const previewFiletype = document.getElementById('preview-filetype');
    const removeFileBtn = document.getElementById('remove-file');
    const uploadProgress = document.getElementById('upload-progress');
    const progressBar = document.getElementById('progress-bar');
    const progressPercent = document.getElementById('progress-percent');
    const uploadMessage = document.getElementById('upload-message');
    const uploadBtn = document.getElementById('upload-btn');

    if (fileInput && uploadArea && uploadForm) {
        // --- Drag and Drop Event Listeners ---
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => uploadArea.classList.add('drag-over'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('drag-over'), false);
        });

        // Handle dropped files
        uploadArea.addEventListener('drop', handleDrop, false);

        // --- Event Handlers ---
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;

            if (files.length > 0) {
                fileInput.files = files;
                showFilePreview(files[0]);
            }
        }

        // Handle file selection via click
        fileInput.addEventListener('change', function (e) {
            if (e.target.files.length > 0) {
                showFilePreview(e.target.files[0]);
            }
        });

        // Handle file removal from preview
        if (removeFileBtn) {
            removeFileBtn.addEventListener('click', function () {
                fileInput.value = ''; // Clear the file input
                hideFilePreview();
                resetUploadArea();
            });
        }

        // Handle form submission via AJAX
        uploadForm.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!fileInput.files.length) {
                showMessage('Please select a file to upload', 'error');
                return;
            }

            uploadFileWithProgress();
        });
    }

    // --- UI Update Functions ---
    function showFilePreview(file) {
        if (!file) return;

        filePreview.classList.remove('hidden');
        previewFilename.textContent = file.name;
        previewFilesize.textContent = formatFileSize(file.size);
        previewFiletype.textContent = getFileType(file.name);
        
        generateThumbnail(file);

        // Update the dropzone text to reflect the selected file
        const uploadText = uploadArea.querySelector('p');
        if (uploadText) {
            uploadText.innerHTML = `<span class="font-semibold text-blue-600">Ready to upload:</span> ${file.name}`;
        }
    }

    function hideFilePreview() {
        filePreview.classList.add('hidden');
    }

    function resetUploadArea() {
        // Restore the original "Click to upload" text
        const uploadText = uploadArea.querySelector('p');
        if (uploadText) {
            uploadText.innerHTML = '<span class="font-semibold">Click to upload</span> or drag and drop';
        }
    }

    function generateThumbnail(file) {
        const fileType = file.type.split('/')[0];
        const extension = file.name.split('.').pop().toLowerCase();

        // Clear previous thumbnail
        previewThumbnail.innerHTML = '';
        previewThumbnail.className = 'w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0';

        if (fileType === 'image') {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'w-full h-full object-cover rounded-lg';
                previewThumbnail.appendChild(img);
            };
            reader.readAsDataURL(file);
        } else if (fileType === 'video') {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.className = 'w-full h-full object-cover rounded-lg';
            video.muted = true;
            previewThumbnail.appendChild(video);
        } else {
            // Fallback to SVG icon for non-image/video files
            previewThumbnail.innerHTML = getFileTypeIconSVG(extension);
        }
    }

    function uploadFileWithProgress() {
        const formData = new FormData(uploadForm);
        const xhr = new XMLHttpRequest();

        uploadProgress.classList.remove('hidden');
        hideMessage();

        // Disable upload button and show loading state
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = `
            <svg class="animate-spin w-5 h-5 inline-block mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
        `;

        xhr.upload.addEventListener('progress', function (e) {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressBar.style.width = percentComplete + '%';
                progressPercent.textContent = Math.round(percentComplete) + '%';
            }
        });

        xhr.addEventListener('load', function () {
            handleUploadResponse(xhr);
        });

        xhr.addEventListener('error', function () {
            handleUploadResponse(null, 'Upload failed: Network error');
        });

        xhr.open('POST', '/upload');
        xhr.send(formData);
    }

    function handleUploadResponse(xhr, networkError = null) {
        uploadProgress.classList.add('hidden'); // Hide progress bar

        if (networkError) {
            showMessage(networkError, 'error');
        } else {
            try {
                const response = JSON.parse(xhr.responseText);
                if (response.success) {
                    showMessage(`File "${response.fileName}" uploaded successfully!`, 'success');
                    fileInput.value = '';
                    hideFilePreview();
                    resetUploadArea();
                    // Reload to show the newly uploaded file in the list
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    showMessage(response.error || 'Upload failed', 'error');
                }
            } catch (error) {
                showMessage('Upload failed: Invalid response from server', 'error');
            }
        }

        // Re-enable upload button and restore its original content
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = `
            <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            Upload File
        `;
    }

    function showMessage(message, type) {
        uploadMessage.classList.remove('hidden');
        if (type === 'success') {
            uploadMessage.className = 'bg-green-50 border border-green-200 rounded-lg p-4 mb-4';
            uploadMessage.innerHTML = `<div class="flex items-center"><svg class="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><p class="text-green-800 font-medium">${message}</p></div>`;
        } else {
            uploadMessage.className = 'bg-red-50 border border-red-200 rounded-lg p-4 mb-4';
            uploadMessage.innerHTML = `<div class="flex items-center"><svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><p class="text-red-800 font-medium">${message}</p></div>`;
        }
    }

    function hideMessage() {
        uploadMessage.classList.add('hidden');
    }
});

// --- Utility Functions ---

// Get a user-friendly file type name
function getFileType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const types = {
        'jpg': 'Image', 'jpeg': 'Image', 'png': 'Image', 'gif': 'Image', 'svg': 'Vector Image', 'webp': 'Image', 'bmp': 'Image', 'ico': 'Icon',
        'pdf': 'PDF Document', 'doc': 'Word Document', 'docx': 'Word Document', 'txt': 'Text File', 'rtf': 'Rich Text', 'odt': 'OpenDocument',
        'xls': 'Excel Spreadsheet', 'xlsx': 'Excel Spreadsheet', 'csv': 'CSV File', 'ods': 'OpenDocument Spreadsheet',
        'ppt': 'PowerPoint', 'pptx': 'PowerPoint', 'odp': 'OpenDocument Presentation',
        'zip': 'ZIP Archive', 'rar': 'RAR Archive', '7z': '7-Zip Archive', 'tar': 'TAR Archive', 'gz': 'GZIP Archive',
        'mp4': 'MP4 Video', 'avi': 'AVI Video', 'mov': 'QuickTime Video', 'mkv': 'MKV Video', 'webm': 'WebM Video', 'flv': 'Flash Video',
        'mp3': 'MP3 Audio', 'wav': 'WAV Audio', 'flac': 'FLAC Audio', 'aac': 'AAC Audio', 'ogg': 'OGG Audio',
        'js': 'JavaScript', 'jsx': 'React Component', 'ts': 'TypeScript', 'tsx': 'React TypeScript',
        'html': 'HTML Document', 'css': 'Stylesheet', 'py': 'Python Script', 'java': 'Java Source', 'cpp': 'C++ Source', 'c': 'C Source', 'h': 'Header File',
        'php': 'PHP Script', 'rb': 'Ruby Script', 'go': 'Go Source', 'rs': 'Rust Source', 'json': 'JSON Data', 'xml': 'XML Document', 'yml': 'YAML File', 'yaml': 'YAML File'
    };
    return types[extension] || 'File';
}

// Get an SVG icon string based on file extension
function getFileTypeIconSVG(extension) {
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(extension)) {
        return `<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`;
    }
    if (['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv'].includes(extension)) {
        return `<svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8,5.14V19.14L19,12.14L8,5.14Z" /></svg>`;
    }
    if (extension === 'pdf') {
        return `<svg class="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>`;
    }
    if (['doc', 'docx'].includes(extension)) {
        return `<svg class="w-8 h-8 text-blue-700" fill="currentColor" viewBox="0 0 24 24"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>`;
    }
    if (['xls', 'xlsx'].includes(extension)) {
        return `<svg class="w-8 h-8 text-green-700" fill="currentColor" viewBox="0 0 24 24"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>`;
    }
    // Default file icon
    return `<svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`;
}

// Format file size into a readable string
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
