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

        // DON'T show form yet - wait for OCR to complete
        // document.getElementById('receipt-form').style.display = 'block';

        // Set default date to today
        document.getElementById('receipt-date').valueAsDate = new Date();

        // Process first image with OCR if it's an image
        const firstImageFile = selectedFiles.find(file => file.type.startsWith('image/'));
        if (firstImageFile) {
            processReceiptWithOCR(firstImageFile);
        } else {
            // No image to process, show form immediately for manual entry
            document.getElementById('receipt-form').style.display = 'block';
        }
    }

    // ========== OCR FUNCTIONALITY ==========
    async function processReceiptWithOCR(imageFile) {
        const ocrLoading = document.getElementById('ocr-loading');
        const ocrProgressFill = document.getElementById('ocr-progress-fill');
        const ocrStatus = document.getElementById('ocr-status');

        try {
            // Show loading indicator
            ocrLoading.classList.add('active');
            ocrStatus.textContent = 'Initializing OCR engine...';
            ocrProgressFill.style.width = '10%';

            console.log('🔍 Starting OCR processing...');

            // Process image with Tesseract
            const result = await Tesseract.recognize(
                imageFile,
                'eng',
                {
                    logger: function (m) {
                        // Update progress
                        if (m.status === 'recognizing text') {
                            const progress = Math.round(m.progress * 100);
                            ocrProgressFill.style.width = `${10 + (progress * 0.8)}%`;
                            ocrStatus.textContent = `Reading receipt... ${progress}%`;
                        }
                    }
                }
            );

            ocrProgressFill.style.width = '95%';
            ocrStatus.textContent = 'Extracting data...';

            console.log('📄 OCR Text extracted:', result.data.text);

            // Parse the extracted text
            const extractedData = parseReceiptText(result.data.text);
            console.log('✅ Extracted data:', extractedData);

            // Auto-fill form fields
            if (extractedData.merchant) {
                const merchantInput = document.getElementById('merchant-name');
                merchantInput.value = extractedData.merchant;
                merchantInput.classList.add('auto-filled');
            }

            if (extractedData.amount) {
                const amountInput = document.getElementById('amount');
                amountInput.value = extractedData.amount;
                amountInput.classList.add('auto-filled');
            }


            if (extractedData.date) {
                const dateInput = document.getElementById('receipt-date');
                dateInput.value = extractedData.date;
                dateInput.classList.add('auto-filled');
            }

            // Success
            ocrProgressFill.style.width = '100%';
            ocrStatus.textContent = '✅ Receipt data extracted!';
            ocrStatus.style.color = '#059669';

            // Show form with pre-filled data immediately
            document.getElementById('receipt-form').style.display = 'block';

            // Hide loading after 1.5 seconds
            setTimeout(function () {
                ocrLoading.classList.remove('active');
            }, 1500);

        } catch (error) {
            console.error('❌ OCR error:', error);
            ocrStatus.textContent = '⚠️ Could not read receipt. Please enter manually.';
            ocrStatus.style.color = '#DC2626';

            // Show form for manual entry even if OCR failed
            document.getElementById('receipt-form').style.display = 'block';

            // Hide loading after 2 seconds
            setTimeout(function () {
                ocrLoading.classList.remove('active');
            }, 2000);
        }
    }

    // Parse extracted text to find merchant, amount, and date
    function parseReceiptText(text) {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        let merchant = '';
        let amount = '';
        let date = '';

        // Find merchant name (usually in first 3 lines, longest line)
        const topLines = lines.slice(0, 5);
        merchant = topLines.reduce((longest, current) => {
            // Skip lines that look like addresses or numbers
            if (current.length > longest.length &&
                !/^\d+/.test(current) &&
                !/(street|st\.|ave|avenue|road|rd\.|blvd)/i.test(current)) {
                return current;
            }
            return longest;
        }, '');

        // Find amount - look for total, amount due, etc.
        const amountPatterns = [
            /(?:total|amount due|balance|grand total)[:\s]*\$?\s*(\d+[.,]\d{2})/i,
            /\$\s*(\d+[.,]\d{2})\s*(?:total|amount|balance)/i,
            /(?:^|\s)(\d+[.,]\d{2})\s*(?:total|amount|balance|due)/i,
            /total[:\s]*(\d+[.,]\d{2})/i,
            /\$\s*(\d+[.,]\d{2})/g  // Fallback: any dollar amount
        ];

        for (const pattern of amountPatterns) {
            const match = text.match(pattern);
            if (match) {
                amount = match[1].replace(',', '.');
                break;
            }
        }

        // Find date - multiple formats
        const datePatterns = [
            /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,  // MM/DD/YYYY or DD-MM-YYYY
            /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,    // YYYY-MM-DD
            /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{2,4}/i,  // Month DD, YYYY
            /\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4}/i     // DD Month YYYY
        ];

        for (const pattern of datePatterns) {
            const match = text.match(pattern);
            if (match) {
                date = convertToISODate(match[0]);
                break;
            }
        }

        return { merchant, amount, date };
    }

    // Convert various date formats to YYYY-MM-DD
    function convertToISODate(dateStr) {
        try {
            const parsed = new Date(dateStr);
            if (!isNaN(parsed.getTime())) {
                const year = parsed.getFullYear();
                const month = String(parsed.getMonth() + 1).padStart(2, '0');
                const day = String(parsed.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
        } catch (e) {
            console.error('Date parsing error:', e);
        }
        return '';
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

        const merchantName = document.getElementById('merchant-name').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const receiptDate = document.getElementById('receipt-date').value;
        const isBusiness = document.getElementById('is-business').value === 'true';
        const notes = document.getElementById('notes').value;

        // Validate required fields
        if (!merchantName) {
            showMessage('Please enter the merchant name', 'error');
            document.getElementById('merchant-name').focus();
            return;
        }

        if (!amount || amount <= 0) {
            showMessage('Please enter a valid amount', 'error');
            document.getElementById('amount').focus();
            return;
        }

        if (!receiptDate) {
            showMessage('Please select the receipt date', 'error');
            document.getElementById('receipt-date').focus();
            return;
        }

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
