(function () {
    'use strict';

    window.SecurityUtils = {
        escapeHtml: function (unsafe) {
            if (typeof unsafe !== 'string') return '';
            const div = document.createElement('div');
            div.textContent = unsafe;
            return div.innerHTML;
        },

        escapeAttribute: function (unsafe) {
            if (typeof unsafe !== 'string') return '';
            return unsafe
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        },

        validateFile: function (file) {
            const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            const MAX_FILE_SIZE = 10 * 1024 * 1024;
            const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf'];
            const BLOCKED_EXTENSIONS = ['php', 'js', 'exe', 'sh', 'bat', 'cmd', 'jsp', 'asp', 'aspx', 'html', 'htm'];

            if (!file) {
                throw new Error('No file provided');
            }

            const fileExt = file.name.split('.').pop().toLowerCase();

            if (BLOCKED_EXTENSIONS.includes(fileExt)) {
                throw new Error(`File type .${fileExt} is not allowed for security reasons`);
            }

            if (!ALLOWED_TYPES.includes(file.type)) {
                throw new Error(`Invalid file type: ${file.type}. Only images (JPG, PNG) and PDF are allowed.`);
            }

            if (file.size > MAX_FILE_SIZE) {
                throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 10MB.`);
            }

            if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
                throw new Error(`Invalid file extension: .${fileExt}. Only .jpg, .jpeg, .png, and .pdf are allowed.`);
            }

            return true;
        },

        sanitizeFilename: function (filename) {
            if (typeof filename !== 'string') return '';
            return filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        },

        enforceHTTPS: function () {
            if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                location.replace(`https:${location.href.substring(location.protocol.length)}`);
            }
        }
    };
})();
