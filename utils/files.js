const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(1))} ${sizes[i]}`;
};

const getFileType = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const types = {
        jpg: 'Image', jpeg: 'Image', png: 'Image', gif: 'Image', svg: 'Vector Image',
        webp: 'Image', bmp: 'Image', ico: 'Icon', pdf: 'PDF Document',
        doc: 'Word Document', docx: 'Word Document', txt: 'Text File',
        xls: 'Excel Spreadsheet', xlsx: 'Excel Spreadsheet', csv: 'CSV File',
        ppt: 'PowerPoint', pptx: 'PowerPoint',
        zip: 'ZIP Archive', rar: 'RAR Archive', '7z': '7-Zip Archive',
        tar: 'TAR Archive', gz: 'GZIP Archive',
        mp4: 'MP4 Video', avi: 'AVI Video', mov: 'QuickTime Video',
        mkv: 'MKV Video', webm: 'WebM Video',
        mp3: 'MP3 Audio', wav: 'WAV Audio', flac: 'FLAC Audio',
        js: 'JavaScript', ts: 'TypeScript', jsx: 'React Component',
        html: 'HTML Document', css: 'Stylesheet',
        py: 'Python Script', java: 'Java Source', go: 'Go Source',
        json: 'JSON Data', xml: 'XML Document', yml: 'YAML File', yaml: 'YAML File',
    };
    return types[ext] || 'File';
};

module.exports = { formatFileSize, getFileType };
