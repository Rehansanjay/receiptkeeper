(function () {
    'use strict';

    // Configuration
    const SUPABASE_URL = 'https://hiscskqwlgavicihsote.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpc2Nza3F3bGdhdmljaWhzb3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDc2MDMsImV4cCI6MjA4NDk4MzYwM30.Acu9LBOgIa_kLlm4gcDb06Dw8cwxnYxeyr_gI7PweL8';

    // Initialize Supabase client
    const supabase = window.supabaseClient || window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    if (!window.supabaseClient) window.supabaseClient = supabase;

    let selectedFiles = [];

    document.addEventListener('DOMContentLoaded', async function () {
        console.log('📤 Upload page loading...');

        // Check authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            console.log('❌ No session, redirecting to login');
            window.location.href = '/login.html';
            return;
        }

        console.log('✅ User authenticated');
        setupUploadHandlers();
        setupLogout();
    });

    function setupUploadHandlers() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        const previewContainer = document.getElementById('preview-container');
        const receiptForm = document.getElementById('receipt-form');

        // Click to upload
        uploadArea.addEventListener('click', function () {
            fileInput.click();
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', function (e) {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', function () {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', function (e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        });

        // File input change
        fileInput.addEventListener('change', function (e) {
            handleFiles(e.target.files);
        });

        // Form submission
        receiptForm.addEventListener('submit', handleFormSubmit);

        // Cancel button
        document.getElementById('cancel-btn').addEventListener('click', function () {
            receiptForm.style.display = 'none';
            selectedFiles = [];
            previewContainer.innerHTML = '';
            fileInput.value = '';
        });
    }

    function handleFiles(files) {
        selectedFiles = Array.from(files);
        displayPreviews();
        document.getElementById('receipt-form').style.display = 'block';

        // Set default date to today
        document.getElementById('receipt-date').valueAsDate = new Date();
    }

    function displayPreviews() {
        const previewContainer = document.getElementById('preview-container');
        previewContainer.innerHTML = '';

        selectedFiles.forEach(function (file, index) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';

                if (file.type.startsWith('image/')) {
                    previewItem.innerHTML = `
                        <img src="${e.target.result}" alt="Preview">
                        <button class="remove-btn" onclick="window.uploadFunctions.removeFile(${index})">×</button>
                    `;
                } else {
                    previewItem.innerHTML = `
                        <div style="height: 150px; display: flex; align-items: center; justify-content: center; background: #f3f4f6;">
                            <span style="font-size: 2rem;">📄</span>
                        </div>
                        <button class="remove-btn" onclick="window.uploadFunctions.removeFile(${index})">×</button>
                    `;
                }

                previewContainer.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        });
    }

    function removeFile(index) {
        selectedFiles.splice(index, 1);
        displayPreviews();

        if (selectedFiles.length === 0) {
            document.getElementById('receipt-form').style.display = 'none';
            document.getElementById('file-input').value = '';
        }
    }

    async function handleFormSubmit(e) {
        e.preventDefault();

        const merchantName = document.getElementById('merchant-name').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const receiptDate = document.getElementById('receipt-date').value;
        const isBusiness = document.getElementById('is-business').value === 'true';
        const notes = document.getElementById('notes').value;

        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';

        try {
            console.log('📤 Uploading receipt...');
            const { data: { user } } = await supabase.auth.getUser();

            // Upload files
            const filePaths = [];
            for (const file of selectedFiles) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

                const { data, error } = await supabase.storage
                    .from('receipts')
                    .upload(fileName, file);

                if (error) throw error;
                filePaths.push(data.path);
            }

            // Save receipt metadata
            const { error: dbError } = await supabase
                .from('receipts')
                .insert({
                    user_id: user.id,
                    merchant_name: merchantName,
                    amount: amount,
                    receipt_date: receiptDate,
                    file_path: filePaths.join(','),
                    notes: notes,
                    is_business: isBusiness
                });

            if (dbError) throw dbError;

            console.log('✅ Receipt uploaded successfully');
            showMessage('Receipt uploaded successfully!', 'success');

            // Reset form and redirect
            setTimeout(function () {
                window.location.href = '/dashboard.html';
            }, 1500);

        } catch (error) {
            console.error('❌ Upload error:', error);
            showMessage(error.message, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Receipt';
        }
    }

    function showMessage(message, type) {
        const messageDiv = document.getElementById(type === 'error' ? 'error-message' : 'success-message');
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';

        if (type === 'success') {
            document.getElementById('error-message').style.display = 'none';
        } else {
            document.getElementById('success-message').style.display = 'none';
        }
    }

    function setupLogout() {
        document.getElementById('logout-btn').addEventListener('click', async function (e) {
            e.preventDefault();
            console.log('🚪 Logging out...');
            await supabase.auth.signOut();
            window.location.href = '/';
        });
    }

    // Expose functions for onclick handlers
    window.uploadFunctions = {
        removeFile
    };

})();
