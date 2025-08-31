// Enhanced file upload with preview and progress
document.addEventListener('DOMContentLoaded', function() {
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
    
    if (fileInput && uploadArea) {
        // Add file-upload-area class for styling
        uploadArea.classList.add('file-upload-area');

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });

        // Handle dropped files
        uploadArea.addEventListener('drop', handleDrop, false);

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function highlight(e) {
            uploadArea.classList.add('drag-over');
        }

        function unhighlight(e) {
            uploadArea.classList.remove('drag-over');
        }

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;

            if (files.length > 0) {
                fileInput.files = files;
                showFilePreview(files[0]);
            }
        }

        // Update file input display when file is selected
        fileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                showFilePreview(e.target.files[0]);
            }
        });

        // Remove file functionality
        if (removeFileBtn) {
            removeFileBtn.addEventListener('click', function() {
                fileInput.value = '';
                hideFilePreview();
                resetUploadArea();
            });
        }

        // Form submission with AJAX and progress
        if (uploadForm) {
            uploadForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                if (!fileInput.files.length) {
                    showMessage('Please select a file to upload', 'error');
                    return;
                }

                uploadFileWithProgress();
            });
        }
    }

    function showFilePreview(file) {
        if (!file) return;

        filePreview.classList.remove('hidden');
        previewFilename.textContent = file.name;
        previewFilesize.textContent = formatFileSize(file.size);
        previewFiletype.textContent = getFileType(file.name);

        // Generate thumbnail based on file type
        generateThumbnail(file);

        // Update upload area text
        const uploadText = uploadArea.querySelector('p');
        if (uploadText) {
            uploadText.innerHTML = `<span class="font-semibold text-blue-600">Ready to upload:</span> ${file.name}`;
        }
    }

    function hideFilePreview() {
        filePreview.classList.add('hidden');
    }

    function resetUploadArea() {
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
            // Show image preview
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'w-full h-full object-cover rounded-lg';
                previewThumbnail.appendChild(img);
            };
            reader.readAsDataURL(file);
        } else if (fileType === 'video') {
            // Show video thumbnail
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.className = 'w-full h-full object-cover rounded-lg';
            video.muted = true;
            
            const playIcon = document.createElement('div');
            playIcon.className = 'absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg';
            playIcon.innerHTML = `
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
                </svg>
            `;
            
            previewThumbnail.style.position = 'relative';
            previewThumbnail.appendChild(video);
            previewThumbnail.appendChild(playIcon);
        } else {
            // Show file type icon
            const icon = getFileTypeIconSVG(extension);
            previewThumbnail.innerHTML = icon;
        }
    }

    function uploadFileWithProgress() {
        const formData = new FormData(uploadForm);
        const xhr = new XMLHttpRequest();

        // Show progress bar
        uploadProgress.classList.remove('hidden');
        hideMessage();
        
        // Disable upload button
        const uploadBtn = document.getElementById('upload-btn');
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = `
            <svg class="animate-spin w-5 h-5 inline-block mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
        `;

        // Track upload progress
        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressBar.style.width = percentComplete + '%';
                progressPercent.textContent = Math.round(percentComplete) + '%';
            }
        });

        // Handle completion
        xhr.addEventListener('load', function() {
            uploadProgress.classList.add('hidden');
            
            try {
                const response = JSON.parse(xhr.responseText);
                
                if (response.success) {
                    showMessage(`File "${response.fileName}" uploaded successfully!`, 'success');
                    
                    // Reset form
                    fileInput.value = '';
                    hideFilePreview();
                    resetUploadArea();
                    
                    // Refresh page after short delay to show new file
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    showMessage(response.error || 'Upload failed', 'error');
                }
            } catch (error) {
                showMessage('Upload failed: Invalid response from server', 'error');
            }
            
            // Re-enable upload button
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = `
                <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                Upload File
            `;
        });

        // Handle errors
        xhr.addEventListener('error', function() {
            uploadProgress.classList.add('hidden');
            showMessage('Upload failed: Network error', 'error');
            
            // Re-enable upload button
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = `
                <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                Upload File
            `;
        });

        // Send the request
        xhr.open('POST', '/upload');
        xhr.send(formData);
    }

    function showMessage(message, type) {
        const messageEl = uploadMessage;
        messageEl.classList.remove('hidden');
        
        if (type === 'success') {
            messageEl.className = 'bg-green-50 border border-green-200 rounded-lg p-4 mb-4 message-enter';
            messageEl.innerHTML = `
                <div class="flex items-center">
                    <svg class="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p class="text-green-800 font-medium">${message}</p>
                </div>
            `;
        } else {
            messageEl.className = 'bg-red-50 border border-red-200 rounded-lg p-4 mb-4 message-enter';
            messageEl.innerHTML = `
                <div class="flex items-center">
                    <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="text-red-800 font-medium">${message}</p>
                </div>
            `;
        }
    }

    function hideMessage() {
        uploadMessage.classList.add('hidden');
    }
});

// File type detection and icon generation
function getFileType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const types = {
        // Images
        'jpg': 'Image', 'jpeg': 'Image', 'png': 'Image', 'gif': 'Image', 
        'svg': 'Vector Image', 'webp': 'Image', 'bmp': 'Image', 'ico': 'Icon',
        
        // Documents
        'pdf': 'PDF Document', 'doc': 'Word Document', 'docx': 'Word Document',
        'txt': 'Text File', 'rtf': 'Rich Text', 'odt': 'OpenDocument',
        
        // Spreadsheets
        'xls': 'Excel Spreadsheet', 'xlsx': 'Excel Spreadsheet', 'csv': 'CSV File',
        'ods': 'OpenDocument Spreadsheet',
        
        // Presentations
        'ppt': 'PowerPoint', 'pptx': 'PowerPoint', 'odp': 'OpenDocument Presentation',
        
        // Archives
        'zip': 'ZIP Archive', 'rar': 'RAR Archive', '7z': '7-Zip Archive',
        'tar': 'TAR Archive', 'gz': 'GZIP Archive',
        
        // Videos
        'mp4': 'MP4 Video', 'avi': 'AVI Video', 'mov': 'QuickTime Video',
        'mkv': 'MKV Video', 'webm': 'WebM Video', 'flv': 'Flash Video',
        
        // Audio
        'mp3': 'MP3 Audio', 'wav': 'WAV Audio', 'flac': 'FLAC Audio',
        'aac': 'AAC Audio', 'ogg': 'OGG Audio',
        
        // Code
        'js': 'JavaScript', 'jsx': 'React Component', 'ts': 'TypeScript', 'tsx': 'React TypeScript',
        'html': 'HTML Document', 'css': 'Stylesheet', 'py': 'Python Script', 
        'java': 'Java Source', 'cpp': 'C++ Source', 'c': 'C Source', 'h': 'Header File',
        'php': 'PHP Script', 'rb': 'Ruby Script', 'go': 'Go Source', 'rs': 'Rust Source',
        'json': 'JSON Data', 'xml': 'XML Document', 'yml': 'YAML File', 'yaml': 'YAML File'
    };
    
    return types[extension] || 'Unknown File';
}

function getFileTypeIconSVG(extension) {
    // Enhanced file type detection matching VS Code icons
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(extension)) {
        return `<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>`;
    }
    
    if (['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv'].includes(extension)) {
        return `<svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>`;
    }
    
    if (extension === 'pdf') {
        return `<svg class="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            <path d="M8,11H16V13H8V11M8,15H16V17H8V15M8,7H16V9H8V7Z" fill="white"/>
        </svg>`;
    }
    
    if (['doc', 'docx'].includes(extension)) {
        return `<svg class="w-8 h-8 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            <path d="M7,11L9,17H11L12.5,12.5L14,17H16L18,11H16L15,14.5L13.5,11H11.5L10,14.5L9,11H7Z" fill="white"/>
        </svg>`;
    }
    
    if (['xls', 'xlsx'].includes(extension)) {
        return `<svg class="w-8 h-8 text-green-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            <path d="M8,12H16V14H8V12M8,16H16V18H8V16M8,8H16V10H8V8Z" fill="white"/>
        </svg>`;
    }
    
    if (['ppt', 'pptx'].includes(extension)) {
        return `<svg class="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            <path d="M8,11V17H10V15H12A2,2 0 0,0 14,13V13A2,2 0 0,0 12,11H8M10,13H12V13H10V13Z" fill="white"/>
        </svg>`;
    }
    
    // Default file icon
    return `<svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
    </svg>`;
}

// Copy to clipboard functionality
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
            showCopyFeedback();
        }).catch(function() {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopyFeedback();
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
    
    document.body.removeChild(textArea);
}

function showCopyFeedback() {
    // Create and show a temporary toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform translate-x-0 transition-transform duration-300';
    toast.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            URL copied to clipboard!
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// File size formatter utility
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            
            // Update button icon
            const icon = mobileMenuButton.querySelector('svg path');
            if (mobileMenu.classList.contains('hidden')) {
                icon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
            } else {
                icon.setAttribute('d', 'M6 18L18 6M6 6l12 12');
            }
        });
    }

    // Enhanced file upload with preview and progress
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
    
    if (fileInput && uploadArea) {
        // Add file-upload-area class for styling
        uploadArea.classList.add('file-upload-area');

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });

        // Handle dropped files
        uploadArea.addEventListener('drop', handleDrop, false);

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function highlight(e) {
            uploadArea.classList.add('drag-over');
        }

        function unhighlight(e) {
            uploadArea.classList.remove('drag-over');
        }

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;

            if (files.length > 0) {
                fileInput.files = files;
                showFilePreview(files[0]);
            }
        }

        // Update file input display when file is selected
        fileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                showFilePreview(e.target.files[0]);
            }
        });

        // Remove file functionality
        if (removeFileBtn) {
            removeFileBtn.addEventListener('click', function() {
                fileInput.value = '';
                hideFilePreview();
                resetUploadArea();
            });
        }

        // Form submission with AJAX and progress
        if (uploadForm) {
            uploadForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                if (!fileInput.files.length) {
                    showMessage('Please select a file to upload', 'error');
                    return;
                }

                uploadFileWithProgress();
            });
        }
    }

    function showFilePreview(file) {
        if (!file) return;

        filePreview.classList.remove('hidden');
        previewFilename.textContent = file.name;
        previewFilesize.textContent = formatFileSize(file.size);
        previewFiletype.textContent = getFileType(file.name);

        // Generate thumbnail based on file type
        generateThumbnail(file);

        // Update upload area text
        const uploadText = uploadArea.querySelector('p');
        if (uploadText) {
            uploadText.innerHTML = `<span class="font-semibold text-blue-600">Ready to upload:</span> ${file.name}`;
        }
    }

    function hideFilePreview() {
        filePreview.classList.add('hidden');
    }

    function resetUploadArea() {
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

        if (fileType === 'image') {
            // Show image preview
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'w-full h-full object-cover rounded-lg';
                previewThumbnail.appendChild(img);
            };
            reader.readAsDataURL(file);
        } else {
            // Show file type icon
            const icon = getFileTypeIcon(extension);
            previewThumbnail.innerHTML = icon;
            previewThumbnail.className = 'w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0';
        }
    }

    function uploadFileWithProgress() {
        const formData = new FormData(uploadForm);
        const xhr = new XMLHttpRequest();

        // Show progress bar
        uploadProgress.classList.remove('hidden');
        hideMessage();
        
        // Disable upload button
        const uploadBtn = document.getElementById('upload-btn');
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = `
            <svg class="animate-spin w-5 h-5 inline-block mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
        `;

        // Track upload progress
        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressBar.style.width = percentComplete + '%';
                progressPercent.textContent = Math.round(percentComplete) + '%';
            }
        });

        // Handle completion
        xhr.addEventListener('load', function() {
            uploadProgress.classList.add('hidden');
            
            try {
                const response = JSON.parse(xhr.responseText);
                
                if (response.success) {
                    showMessage(`File "${response.fileName}" uploaded successfully!`, 'success');
                    
                    // Reset form
                    fileInput.value = '';
                    hideFilePreview();
                    resetUploadArea();
                    
                    // Refresh page after short delay to show new file
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    showMessage(response.error || 'Upload failed', 'error');
                }
            } catch (error) {
                showMessage('Upload failed: Invalid response from server', 'error');
            }
            
            // Re-enable upload button
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = `
                <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                Upload File
            `;
        });

        // Handle errors
        xhr.addEventListener('error', function() {
            uploadProgress.classList.add('hidden');
            showMessage('Upload failed: Network error', 'error');
            
            // Re-enable upload button
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = `
                <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                Upload File
            `;
        });

        // Send the request
        xhr.open('POST', '/upload');
        xhr.send(formData);
    }

    function showMessage(message, type) {
        const messageEl = uploadMessage;
        messageEl.classList.remove('hidden');
        
        if (type === 'success') {
            messageEl.className = 'bg-green-50 border border-green-200 rounded-lg p-4 mb-4';
            messageEl.innerHTML = `
                <div class="flex items-center">
                    <svg class="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p class="text-green-800 font-medium">${message}</p>
                </div>
            `;
        } else {
            messageEl.className = 'bg-red-50 border border-red-200 rounded-lg p-4 mb-4';
            messageEl.innerHTML = `
                <div class="flex items-center">
                    <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="text-red-800 font-medium">${message}</p>
                </div>
            `;
        }
    }

    function hideMessage() {
        uploadMessage.classList.add('hidden');
    }

    // Add fade-in animation to page elements
    const animatedElements = document.querySelectorAll('.bg-white, .bg-gray-50');
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            el.style.transition = 'all 0.5s ease-out';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// File type detection and icon generation
function getFileType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const types = {
        // Images
        'jpg': 'Image', 'jpeg': 'Image', 'png': 'Image', 'gif': 'Image', 
        'svg': 'Vector Image', 'webp': 'Image', 'bmp': 'Image', 'ico': 'Icon',
        
        // Documents
        'pdf': 'PDF Document', 'doc': 'Word Document', 'docx': 'Word Document',
        'txt': 'Text File', 'rtf': 'Rich Text', 'odt': 'OpenDocument',
        
        // Spreadsheets
        'xls': 'Excel Spreadsheet', 'xlsx': 'Excel Spreadsheet', 'csv': 'CSV File',
        'ods': 'OpenDocument Spreadsheet',
        
        // Presentations
        'ppt': 'PowerPoint', 'pptx': 'PowerPoint', 'odp': 'OpenDocument Presentation',
        
        // Archives
        'zip': 'ZIP Archive', 'rar': 'RAR Archive', '7z': '7-Zip Archive',
        'tar': 'TAR Archive', 'gz': 'GZIP Archive',
        
        // Videos
        'mp4': 'MP4 Video', 'avi': 'AVI Video', 'mov': 'QuickTime Video',
        'mkv': 'MKV Video', 'webm': 'WebM Video', 'flv': 'Flash Video',
        
        // Audio
        'mp3': 'MP3 Audio', 'wav': 'WAV Audio', 'flac': 'FLAC Audio',
        'aac': 'AAC Audio', 'ogg': 'OGG Audio',
        
        // Code
        'js': 'JavaScript', 'html': 'HTML Document', 'css': 'Stylesheet',
        'py': 'Python Script', 'java': 'Java Source', 'cpp': 'C++ Source',
        'c': 'C Source', 'php': 'PHP Script', 'rb': 'Ruby Script',
        'go': 'Go Source', 'rs': 'Rust Source', 'ts': 'TypeScript',
        'json': 'JSON Data', 'xml': 'XML Document', 'yml': 'YAML File',
        'yaml': 'YAML File'
    };
    
    return types[extension] || 'Unknown File';
}

function getFileTypeIcon(extension) {
    const iconMap = {
        // Images
        'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'svg': '🖼️', 'webp': '🖼️',
        
        // Documents  
        'pdf': '📄', 'doc': '📝', 'docx': '📝', 'txt': '📄', 'rtf': '📄',
        
        // Spreadsheets
        'xls': '📊', 'xlsx': '📊', 'csv': '📊',
        
        // Archives
        'zip': '📦', 'rar': '📦', '7z': '📦', 'tar': '📦', 'gz': '📦',
        
        // Videos
        'mp4': '🎬', 'avi': '🎬', 'mov': '🎬', 'mkv': '🎬', 'webm': '🎬',
        
        // Audio
        'mp3': '🎵', 'wav': '🎵', 'flac': '🎵', 'aac': '🎵', 'ogg': '🎵',
        
        // Code
        'js': '💻', 'html': '🌐', 'css': '🎨', 'py': '🐍', 'java': '☕',
        'cpp': '⚙️', 'c': '⚙️', 'php': '🔧', 'json': '📋', 'xml': '📋'
    };
    
    const emoji = iconMap[extension] || '📄';
    return `<span class="text-2xl">${emoji}</span>`;
}

// Copy to clipboard functionality
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
            showCopyFeedback();
        }).catch(function() {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopyFeedback();
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
    
    document.body.removeChild(textArea);
}

function showCopyFeedback() {
    // Create and show a temporary toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform translate-x-0 transition-transform duration-300';
    toast.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            URL copied to clipboard!
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// File size formatter utility
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Enhanced file type detection and icon assignment
function getFileTypeIconSVG(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    
    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(extension)) {
        return `<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>`;
    }
    
    // Video files
    if (['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv'].includes(extension)) {
        return `<svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>`;
    }
    
    // Audio files
    if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(extension)) {
        return `<svg class="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
        </svg>`;
    }
    
    // Archive files
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
        return `<svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
        </svg>`;
    }
    
    // PDF files
    if (extension === 'pdf') {
        return `<svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>`;
    }
    
    // Code files
    if (['js', 'html', 'css', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs', 'ts'].includes(extension)) {
        return `<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
        </svg>`;
    }
    
    // Default file icon
    return `<svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
    </svg>`;
}// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            
            // Update button icon
            const icon = mobileMenuButton.querySelector('svg path');
            if (mobileMenu.classList.contains('hidden')) {
                icon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
            } else {
                icon.setAttribute('d', 'M6 18L18 6M6 6l12 12');
            }
        });
    }

    // File upload drag and drop functionality
    const fileInput = document.getElementById('file');
    const uploadArea = document.querySelector('label[for="file"]');
    
    if (fileInput && uploadArea) {
        // Add file-upload-area class for styling
        uploadArea.classList.add('file-upload-area');

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });

        // Handle dropped files
        uploadArea.addEventListener('drop', handleDrop, false);

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function highlight(e) {
            uploadArea.classList.add('drag-over');
        }

        function unhighlight(e) {
            uploadArea.classList.remove('drag-over');
        }

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;

            if (files.length > 0) {
                fileInput.files = files;
                updateFileInputDisplay(files[0].name);
            }
        }

        // Update file input display when file is selected
        fileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                updateFileInputDisplay(e.target.files[0].name);
            }
        });

        function updateFileInputDisplay(fileName) {
            const uploadText = uploadArea.querySelector('p');
            if (uploadText) {
                uploadText.innerHTML = `<span class="font-semibold text-blue-600">Selected:</span> ${fileName}`;
            }
        }
    }

    // Add fade-in animation to page elements
    const animatedElements = document.querySelectorAll('.bg-white, .bg-gray-50');
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            el.style.transition = 'all 0.5s ease-out';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// Copy to clipboard functionality
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
            showCopyFeedback();
        }).catch(function() {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopyFeedback();
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
    
    document.body.removeChild(textArea);
}

function showCopyFeedback() {
    // Create and show a temporary toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform translate-x-0 transition-transform duration-300';
    toast.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            URL copied to clipboard!
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// File size formatter utility
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading states for form submissions
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', function() {
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
            `;
            submitButton.disabled = true;
        }
    });
});

// Enhanced file type detection and icon assignment
function getFileTypeIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const icons = {
        // Images
        'jpg': 'text-green-600',
        'jpeg': 'text-green-600',
        'png': 'text-green-600',
        'gif': 'text-green-600',
        'svg': 'text-green-600',
        'webp': 'text-green-600',
        
        // Documents
        'pdf': 'text-red-600',
        'doc': 'text-blue-600',
        'docx': 'text-blue-600',
        'txt': 'text-gray-600',
        'rtf': 'text-gray-600',
        
        // Spreadsheets
        'xls': 'text-green-700',
        'xlsx': 'text-green-700',
        'csv': 'text-green-700',
        
        // Archives
        'zip': 'text-yellow-600',
        'rar': 'text-yellow-600',
        '7z': 'text-yellow-600',
        'tar': 'text-yellow-600',
        'gz': 'text-yellow-600',
        
        // Videos
        'mp4': 'text-purple-600',
        'avi': 'text-purple-600',
        'mov': 'text-purple-600',
        'mkv': 'text-purple-600',
        'webm': 'text-purple-600',
        
        // Audio
        'mp3': 'text-pink-600',
        'wav': 'text-pink-600',
        'flac': 'text-pink-600',
        'aac': 'text-pink-600',
        
        // Code
        'js': 'text-yellow-500',
        'html': 'text-orange-600',
        'css': 'text-blue-500',
        'py': 'text-blue-400',
        'java': 'text-red-500',
        'cpp': 'text-blue-700',
        'c': 'text-blue-700'
    };
    
    return icons[extension] || 'text-gray-600';
}