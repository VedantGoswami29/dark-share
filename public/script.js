// ── Utility functions ────────────────────────────────────────────────────────

function formatFileSize(bytes) {
    if (!bytes) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileType(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const types = {
        jpg: 'Image', jpeg: 'Image', png: 'Image', gif: 'Image', svg: 'Vector Image',
        webp: 'Image', bmp: 'Image', ico: 'Icon', pdf: 'PDF Document',
        doc: 'Word Document', docx: 'Word Document', txt: 'Text File',
        xls: 'Excel Spreadsheet', xlsx: 'Excel Spreadsheet', csv: 'CSV File',
        ppt: 'PowerPoint', pptx: 'PowerPoint', zip: 'ZIP Archive',
        mp4: 'MP4 Video', mp3: 'MP3 Audio', js: 'JavaScript', ts: 'TypeScript',
        py: 'Python Script', json: 'JSON Data', html: 'HTML Document', css: 'Stylesheet',
    };
    return types[ext] || 'File';
}

// ── Upload page logic ────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    const uploadArea    = document.getElementById('upload-area');
    const fileInput     = document.getElementById('file');
    const uploadForm    = document.getElementById('upload-form');
    const filePreview   = document.getElementById('file-preview');
    const uploadBtn     = document.getElementById('upload-btn');
    const uploadMessage = document.getElementById('upload-message');
    const uploadProgress = document.getElementById('upload-progress');
    const progressBar   = document.getElementById('progress-bar');
    const progressPct   = document.getElementById('progress-percent');

    if (!uploadForm) return; // not on upload page

    let selectedFiles = [];

    // ── Drag & Drop ──────────────────────────────────────────────────────────

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
        uploadArea.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); });
        document.body.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); });
    });
    ['dragenter', 'dragover'].forEach(evt =>
        uploadArea.addEventListener(evt, () => uploadArea.classList.add('drag-over')));
    ['dragleave', 'drop'].forEach(evt =>
        uploadArea.addEventListener(evt, () => uploadArea.classList.remove('drag-over')));
    uploadArea.addEventListener('drop', e => selectFiles(Array.from(e.dataTransfer.files)));

    // ── File selection ───────────────────────────────────────────────────────

    fileInput.addEventListener('change', e => selectFiles(Array.from(e.target.files)));

    function selectFiles(files) {
        selectedFiles = files;
        renderPreviews();
        const label = uploadArea.querySelector('p');
        if (label) {
            label.innerHTML = files.length
                ? `<span class="font-semibold text-blue-600">Ready:</span> ${files.length} file(s) selected`
                : '<span class="font-semibold">Click to upload</span> or drag and drop';
        }
    }

    function renderPreviews() {
        if (!filePreview) return;
        filePreview.innerHTML = '';

        if (!selectedFiles.length) {
            filePreview.classList.add('hidden');
            if (uploadBtn) uploadBtn.disabled = true;
            return;
        }

        filePreview.classList.remove('hidden');
        if (uploadBtn) uploadBtn.disabled = false;

        selectedFiles.forEach((file, idx) => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between p-3 bg-gray-50 border rounded-lg';
            item.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                        </svg>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-900 truncate">${file.name}</p>
                        <p class="text-xs text-gray-500">${formatFileSize(file.size)}</p>
                        <p class="text-xs text-blue-600">${getFileType(file.name)}</p>
                    </div>
                </div>
                <button type="button" data-index="${idx}" class="text-red-500 hover:text-red-700 p-1">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>`;
            filePreview.appendChild(item);
        });

        filePreview.querySelectorAll('button[data-index]').forEach(btn => {
            btn.addEventListener('click', e => {
                selectedFiles.splice(+e.currentTarget.dataset.index, 1);
                renderPreviews();
            });
        });
    }

    // ── Form submission ──────────────────────────────────────────────────────

    uploadForm.addEventListener('submit', e => {
        e.preventDefault();
        if (!selectedFiles.length) return showMessage('Please select a file', 'error');

        const formData = new FormData();
        const currentPathInput = uploadForm.querySelector('input[name="currentPath"]');
        if (currentPathInput) formData.append('currentPath', currentPathInput.value);
        selectedFiles.forEach(f => formData.append('files', f));

        const xhr = new XMLHttpRequest();
        setUploading(true);

        xhr.upload.addEventListener('progress', e => {
            if (e.lengthComputable) {
                const pct = Math.round((e.loaded / e.total) * 100);
                if (progressBar) progressBar.style.width = `${pct}%`;
                if (progressPct) progressPct.textContent = `${pct}%`;
            }
        });

        xhr.addEventListener('load', () => {
            setUploading(false);
            try {
                const res = JSON.parse(xhr.responseText);
                if (res.success) {
                    showMessage(res.message || 'Upload successful!', 'success');
                    selectFiles([]);
                    fileInput.value = '';
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    showMessage(res.error || 'Upload failed', 'error');
                }
            } catch {
                showMessage('Invalid server response', 'error');
            }
        });

        xhr.addEventListener('error', () => {
            setUploading(false);
            showMessage('Network error during upload', 'error');
        });

        xhr.open('POST', '/upload');
        xhr.send(formData);
    });

    // ── Helpers ──────────────────────────────────────────────────────────────

    const UPLOAD_ICON = `
        <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
        </svg>Upload File`;

    const SPIN_ICON = `
        <svg class="animate-spin w-5 h-5 inline-block mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>Uploading...`;

    function setUploading(isUploading) {
        if (uploadProgress) uploadProgress.classList.toggle('hidden', !isUploading);
        if (uploadBtn) {
            uploadBtn.disabled = isUploading;
            uploadBtn.innerHTML = isUploading ? SPIN_ICON : UPLOAD_ICON;
        }
        if (!isUploading && uploadMessage) uploadMessage.classList.add('hidden');
    }

    function showMessage(text, type) {
        if (!uploadMessage) return;
        const isSuccess = type === 'success';
        uploadMessage.className = `rounded-lg p-4 mb-4 border ${
            isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`;
        const icon = isSuccess
            ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`
            : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>`;
        uploadMessage.innerHTML = `
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-2 ${isSuccess ? 'text-green-400' : 'text-red-400'}"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">${icon}</svg>
                <p class="${isSuccess ? 'text-green-800' : 'text-red-800'} font-medium">${text}</p>
            </div>`;
        uploadMessage.classList.remove('hidden');
    }

    // ── Mobile menu ──────────────────────────────────────────────────────────

    const menuBtn  = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', e => {
            e.preventDefault();
            mobileMenu.classList.toggle('hidden');
            const path = menuBtn.querySelector('path');
            if (path) {
                path.setAttribute('d', mobileMenu.classList.contains('hidden')
                    ? 'M4 6h16M4 12h16M4 18h16'
                    : 'M6 18L18 6M6 6l12 12');
            }
        });
    }
});

// ── QR Code page ─────────────────────────────────────────────────────────────

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target.closest('button');
        if (!btn) return;
        const orig = btn.innerHTML;
        btn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
        btn.classList.add('text-green-600');
        setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('text-green-600'); }, 2000);
    });
}
