(function () {
    'use strict';

    // Configuration
    const SUPABASE_URL = 'https://hiscskqwlgavicihsote.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpc2Nza3F3bGdhdmljaWhzb3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDc2MDMsImV4cCI6MjA4NDk4MzYwM30.Acu9LBOgIa_kLlm4gcDb06Dw8cwxnYxeyr_gI7PweL8';

    // Initialize Supabase client
    const supabase = window.supabaseClient || window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    if (!window.supabaseClient) window.supabaseClient = supabase;

    let selectedFiles = [];
    let userSubscriptionInfo = null; // Store user's subscription details

    // ========== SUBSCRIPTION TIER MANAGEMENT ==========

    // Fetch user's subscription info
    async function getUserSubscriptionInfo() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('subscription_tier, ocr_engine, monthly_upload_count, upload_limit, currency')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching subscription info:', error);
                return null;
            }

            console.log('📊 Subscription info:', profile);
            return profile;
        } catch (error) {
            console.error('Error getting subscription info:', error);
            return null;
        }
    }

    // Check if user can upload (within limits)
    function canUpload(subscriptionInfo) {
        if (!subscriptionInfo) return false;
        return subscriptionInfo.monthly_upload_count < subscriptionInfo.upload_limit;
    }

    // Display usage stats on the page
    function displayUsageStats(subscriptionInfo) {
        if (!subscriptionInfo) return;

        const usageContainer = document.getElementById('usage-stats');
        if (!usageContainer) return;

        const remaining = subscriptionInfo.upload_limit - subscriptionInfo.monthly_upload_count;
        const percentUsed = (subscriptionInfo.monthly_upload_count / subscriptionInfo.upload_limit) * 100;

        // Determine tier badge color
        const tierColors = {
            'free': '#6B7280',
            'pro': '#3B82F6',
            'premium': '#8B5CF6'
        };
        const tierColor = tierColors[subscriptionInfo.subscription_tier] || '#6B7280';

        usageContainer.innerHTML = `
            <div style="background: white; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                    <div>
                        <span style="background: ${tierColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">
                            ${subscriptionInfo.subscription_tier}
                        </span>
                        <span style="margin-left: 0.5rem; color: #6B7280; font-size: 0.875rem;">
                            ${subscriptionInfo.ocr_engine === 'ocrspace' ? '🤖 Premium OCR' : '📝 Basic OCR'}
                        </span>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.875rem; color: #6B7280;">This month</div>
                        <div style="font-size: 1.25rem; font-weight: 600; color: ${remaining <= 2 ? '#DC2626' : '#111827'};">
                            ${remaining} / ${subscriptionInfo.upload_limit}
                        </div>
                    </div>
                </div>
                <div style="background: #E5E7EB; border-radius: 9999px; height: 8px; overflow: hidden;">
                    <div style="background: ${percentUsed >= 90 ? '#DC2626' : '#3B82F6'}; height: 100%; width: ${percentUsed}%; transition: width 0.3s;"></div>
                </div>
                ${subscriptionInfo.subscription_tier === 'free' && remaining <= 5 ? `
                    <div style="margin-top: 0.75rem; padding: 0.75rem; background: #FEF3C7; border-radius: 6px; border-left: 3px solid #F59E0B;">
                        <div style="font-size: 0.875rem; color: #92400E;">
                            ⚠️ Running low on uploads! <a href="/pricing.html" style="color: #D97706; font-weight: 600; text-decoration: underline;">Upgrade to Pro</a> for 100 uploads/month with AI-powered OCR.
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Show upgrade modal when limit reached
    function showUpgradeModal(message) {
        const modal = document.createElement('div');
        modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;';

        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 500px; margin: 1rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
                <div style="text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🚀</div>
                    <h2 style="font-size: 1.5rem; font-weight: 700; color: #111827; margin-bottom: 0.5rem;">Upgrade Required</h2>
                    <p style="color: #6B7280; margin-bottom: 1.5rem;">${message}</p>
                    
                    <div style="background: #F3F4F6; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; text-align: left;">
                        <div style="font-weight: 600; color: #111827; margin-bottom: 0.5rem;">✨ Upgrade to Pro and get:</div>
                        <ul style="color: #6B7280; font-size: 0.875rem; margin-left: 1.5rem;">
                            <li>100 uploads per month</li>
                            <li>AI-powered OCR (95%+ accuracy)</li>
                            <li>Minimal manual corrections</li>
                            <li>Priority support</li>
                        </ul>
                        <div style="margin-top: 0.75rem; font-size: 1.25rem; font-weight: 700; color: #3B82F6;">Only $19/month or ₹199/month</div>
                    </div>
                    
                    <div style="display: flex; gap: 0.75rem;">
                        <button onclick="this.closest('div[style*=fixed]').remove()" style="flex: 1; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 6px; background: white; color: #374151; font-weight: 600; cursor: pointer;">
                            Maybe Later
                        </button>
                        <a href="/pricing.html" style="flex: 1; padding: 0.75rem; border-radius: 6px; background: #3B82F6; color: white; font-weight: 600; text-decoration: none; text-align: center;">
                            View Plans
                        </a>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    document.addEventListener('DOMContentLoaded', async function () {
        console.log('📤 Upload page loading...');

        // Enforce HTTPS in production
        SecurityUtils.enforceHTTPS();

        // Check authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            console.log('❌ No session, redirecting to login');
            window.location.href = '/login.html';
            return;
        }

        console.log('✅ User authenticated');

        // Fetch subscription info
        userSubscriptionInfo = await getUserSubscriptionInfo();
        if (userSubscriptionInfo) {
            displayUsageStats(userSubscriptionInfo);
        }

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

        // Camera button - opens camera on mobile
        const cameraBtn = document.getElementById('camera-btn');
        if (cameraBtn) {
            cameraBtn.addEventListener('click', function (e) {
                e.stopPropagation(); // Prevent upload area click
                // Create a temporary file input with camera capture
                const cameraInput = document.createElement('input');
                cameraInput.type = 'file';
                cameraInput.accept = 'image/*';
                cameraInput.capture = 'environment'; // Use rear camera
                cameraInput.onchange = function (e) {
                    handleFiles(e.target.files);
                };
                cameraInput.click();
            });
        }

        // Browse button - opens file picker
        const browseBtn = document.getElementById('browse-btn');
        if (browseBtn) {
            browseBtn.addEventListener('click', function (e) {
                e.stopPropagation(); // Prevent upload area click
                fileInput.click();
            });
        }
    }


    async function handleFiles(files) {
        // Check upload limit before processing
        if (!userSubscriptionInfo) {
            userSubscriptionInfo = await getUserSubscriptionInfo();
        }

        if (!canUpload(userSubscriptionInfo)) {
            const tier = userSubscriptionInfo.subscription_tier;
            const limit = userSubscriptionInfo.upload_limit;
            showUpgradeModal(`You've used all ${limit} uploads this month. Upgrade to continue uploading receipts!`);
            return;
        }

        const validatedFiles = [];
        const errors = [];

        for (const file of files) {
            try {
                SecurityUtils.validateFile(file);
                validatedFiles.push(file);
            } catch (error) {
                errors.push(error.message);
            }
        }

        if (errors.length > 0) {
            alert(errors.join('\n'));
            return;
        }

        selectedFiles = validatedFiles;
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

    // Image preprocessing for better OCR accuracy (10-25% improvement)
    async function preprocessImage(file) {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);

            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                // Resize to optimal width (max 1200px)
                const maxWidth = 1200;
                const scale = Math.min(maxWidth / img.width, 1);

                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                // Draw image
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Convert to grayscale and apply binary threshold
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                for (let i = 0; i < data.length; i += 4) {
                    // Convert to grayscale
                    let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                    // Apply binary threshold (140 works well for receipts)
                    gray = gray > 140 ? 255 : 0;
                    data[i] = data[i + 1] = data[i + 2] = gray;
                }

                ctx.putImageData(imageData, 0, 0);

                // Convert to blob
                canvas.toBlob(blob => resolve(blob), "image/jpeg", 0.9);
            };
        });
    }

    // Helper function to split text into clean lines
    function getLines(text) {
        return text
            .split("\n")
            .map(l => l.trim())
            .filter(l => l.length > 0);
    }

    // Extract merchant name (SMART - handles various receipt formats)
    function extractMerchant(lines) {
        // Blacklist words that indicate NON-merchant lines
        const blacklist = /^(server|cashier|clerk|table|date|time|phone|tel|fax|receipt|invoice|order|check|ticket|terminal|store|trans|ref|auth|card|visa|master|amex|debit|credit|change|cash|subtotal|total|tax|tip|balance|thank|welcome|please|have a|come again|www\.|http|@|#\d+$)/i;

        // Patterns that look like addresses (skip these)
        const addressPattern = /\d+\s+(street|st|ave|avenue|road|rd|blvd|drive|dr|lane|ln|way|place|pl|court|ct)\b/i;

        // Pattern for phone numbers
        const phonePattern = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

        let bestCandidate = "";
        let bestScore = 0;

        // Check first 10 lines (merchant usually at top)
        for (const line of lines.slice(0, 10)) {
            const trimmed = line.trim();
            if (trimmed.length < 3) continue;

            // Skip if matches blacklist
            if (blacklist.test(trimmed)) continue;

            // Skip if looks like address
            if (addressPattern.test(trimmed)) continue;

            // Skip if looks like phone number
            if (phonePattern.test(trimmed)) continue;

            // Skip if mostly numbers (more than 50% digits)
            const digits = trimmed.replace(/[^0-9]/g, "").length;
            const total = trimmed.length;
            if (digits / total > 0.5) continue;

            // Score this line (higher = better merchant candidate)
            let score = 0;

            // Prefer lines with more letters
            const letters = trimmed.replace(/[^A-Za-z]/g, "").length;
            score += letters * 2;

            // Prefer ALL CAPS (many receipts print merchant in caps)
            if (trimmed === trimmed.toUpperCase() && letters > 3) {
                score += 20;
            }

            // Prefer shorter lines (merchant names are usually concise)
            if (trimmed.length <= 25) score += 10;

            // Prefer lines near the very top
            const lineIndex = lines.indexOf(line);
            if (lineIndex < 3) score += 15;

            // Penalize lines with special chars (except &, ', -)
            const specialChars = trimmed.replace(/[A-Za-z0-9\s&'\-]/g, "").length;
            score -= specialChars * 3;

            if (score > bestScore) {
                bestScore = score;
                bestCandidate = trimmed;
            }
        }

        return bestCandidate;
    }

    // Extract total amount (MOST IMPORTANT - looks for "total" keyword first)
    function extractTotal(lines) {
        // First pass: look for lines with "total" keyword (from bottom up)
        // Avoid "subtotal" - we want the final total
        for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i].toLowerCase();
            // Match "total" but not "subtotal"
            if (/\btotal\b/i.test(line) && !/subtotal/i.test(line)) {
                const m = lines[i].match(/(\d+\.\d{2})/);
                if (m) return m[1];
            }
        }

        // Second pass: look for "grand total", "amount due", "balance due"
        for (let i = lines.length - 1; i >= 0; i--) {
            if (/grand\s*total|amount\s*due|balance\s*due|you\s*owe/i.test(lines[i])) {
                const m = lines[i].match(/(\d+\.\d{2})/);
                if (m) return m[1];
            }
        }

        // Third pass: find largest dollar amount (usually the total)
        let max = 0;
        for (const line of lines) {
            const nums = line.match(/\d+\.\d{2}/g);
            if (nums) {
                nums.forEach(n => max = Math.max(max, parseFloat(n)));
            }
        }

        return max ? max.toFixed(2) : "";
    }

    // Extract date from receipt (UNIVERSAL - handles almost any format)
    function extractDate(lines) {
        const currentYear = new Date().getFullYear();
        const fullText = lines.join(" ");

        console.log('🔍 [DATE DEBUG] Searching for date in text...');

        // Store all found dates with their positions
        const foundDates = [];

        // Helper to validate and convert a date
        function tryDate(mm, dd, yyyy, source) {
            const m = parseInt(mm, 10);
            const d = parseInt(dd, 10);
            const y = parseInt(yyyy, 10);

            // Validate ranges
            if (m < 1 || m > 12) return null;
            if (d < 1 || d > 31) return null;
            if (y < 2000 || y > currentYear) return null;

            const result = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            console.log(`📅 [DATE DEBUG] Found valid date from ${source}: ${result}`);
            return result;
        }

        // Pattern 1: MM/DD/YYYY, M/D/YYYY, MM-DD-YYYY, MM.DD.YYYY (4-digit year)
        let match;
        const p1 = /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\b/g;
        while ((match = p1.exec(fullText)) !== null) {
            const result = tryDate(match[1], match[2], match[3], 'Pattern1-MMDDYYYY');
            if (result) foundDates.push(result);
        }

        // Pattern 2: YYYY-MM-DD, YYYY/MM/DD (ISO format)
        const p2 = /\b(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})\b/g;
        while ((match = p2.exec(fullText)) !== null) {
            const result = tryDate(match[2], match[3], match[1], 'Pattern2-YYYYMMDD');
            if (result) foundDates.push(result);
        }

        // Pattern 3: MM/DD/YY, M/D/YY (2-digit year)
        const p3 = /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})\b/g;
        while ((match = p3.exec(fullText)) !== null) {
            let yy = parseInt(match[3], 10);
            let yyyy = yy > 50 ? 1900 + yy : 2000 + yy;
            const result = tryDate(match[1], match[2], yyyy, 'Pattern3-MMDDYY');
            if (result) foundDates.push(result);
        }

        // Pattern 4: DD/MM/YYYY (European format - try if first didn't work)
        // Only use if month looks invalid in US format
        const p4 = /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\b/g;
        while ((match = p4.exec(fullText)) !== null) {
            const d = parseInt(match[1], 10);
            const m = parseInt(match[2], 10);
            // If first number > 12, it's probably day (European)
            if (d > 12 && m <= 12) {
                const result = tryDate(m, d, match[3], 'Pattern4-DDMMYYYY-Euro');
                if (result) foundDates.push(result);
            }
        }

        // Pattern 5: Text months - "Jan 15, 2024" or "Jan 15 2024"
        const months = {
            'jan': 1, 'january': 1, 'feb': 2, 'february': 2, 'mar': 3, 'march': 3,
            'apr': 4, 'april': 4, 'may': 5, 'jun': 6, 'june': 6, 'jul': 7, 'july': 7,
            'aug': 8, 'august': 8, 'sep': 9, 'sept': 9, 'september': 9,
            'oct': 10, 'october': 10, 'nov': 11, 'november': 11, 'dec': 12, 'december': 12
        };

        const p5 = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s*(\d{1,2}),?\s*(\d{4})\b/gi;
        while ((match = p5.exec(fullText)) !== null) {
            const m = months[match[1].toLowerCase()];
            if (m) {
                const result = tryDate(m, match[2], match[3], 'Pattern5-TextMonth');
                if (result) foundDates.push(result);
            }
        }

        // Pattern 6: "15 Jan 2024" or "15-Jan-2024"
        const p6 = /\b(\d{1,2})[\s\-]*(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?[\s\-]*(\d{4})\b/gi;
        while ((match = p6.exec(fullText)) !== null) {
            const m = months[match[2].toLowerCase()];
            if (m) {
                const result = tryDate(m, match[1], match[3], 'Pattern6-DayTextMonth');
                if (result) foundDates.push(result);
            }
        }

        // Pattern 7: "15 Jan 24" or "15-Jan-24" (2-digit year with text month)
        const p7 = /\b(\d{1,2})[\s\-]*(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?[\s\-]*(\d{2})\b/gi;
        while ((match = p7.exec(fullText)) !== null) {
            const m = months[match[2].toLowerCase()];
            if (m) {
                let yy = parseInt(match[3], 10);
                let yyyy = yy > 50 ? 1900 + yy : 2000 + yy;
                const result = tryDate(m, match[1], yyyy, 'Pattern7-DayTextMonthYY');
                if (result) foundDates.push(result);
            }
        }

        // Pattern 8: Look for lines with "DATE" keyword
        for (const line of lines) {
            if (/date/i.test(line)) {
                console.log('🔍 [DATE DEBUG] Found line with DATE keyword:', line);
                // Try to extract any date pattern from this line
                const dateMatch = line.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
                if (dateMatch) {
                    let yyyy = dateMatch[3].length === 2
                        ? (parseInt(dateMatch[3], 10) > 50 ? 1900 : 2000) + parseInt(dateMatch[3], 10)
                        : parseInt(dateMatch[3], 10);
                    const result = tryDate(dateMatch[1], dateMatch[2], yyyy, 'Pattern8-DateKeyword');
                    if (result) foundDates.push(result);
                }
            }
        }

        if (foundDates.length === 0) {
            console.log('❌ [DATE DEBUG] No valid dates found');
            return "";
        }

        // Return the first valid date found
        console.log('✅ [DATE DEBUG] Using date:', foundDates[0]);
        return foundDates[0];
    }

    // Extract tax amount (UNIVERSAL - handles various formats and labels)
    function extractTax(lines) {
        console.log('🔍 [TAX DEBUG] Searching for tax amount...');

        // Many different ways tax can be written
        const taxKeywords = [
            'tax', 'sales tax', 'state tax', 'local tax', 'city tax',
            'vat', 'gst', 'hst', 'pst', 'qst',
            'excise', 'levy', 'duty',
            'tax amt', 'tax amount', 'tax total',
            'txbl', 'tx'  // Abbreviated versions
        ];

        // Build regex from keywords
        const taxPattern = new RegExp('\\b(' + taxKeywords.join('|') + ')\\b', 'i');

        // Skip patterns
        const skipPatterns = /tax\s*(id|exempt|free|included|number|#|no\.|registration)/i;

        // Look for tax lines
        for (const line of lines) {
            if (taxPattern.test(line)) {
                console.log('🔍 [TAX DEBUG] Found potential tax line:', line);

                if (skipPatterns.test(line)) {
                    console.log('⏭️ [TAX DEBUG] Skipping (tax ID/exempt/etc.)');
                    continue;
                }

                // Find any monetary amount on this line
                // Handles: $5.23, 5.23, $5,23 (European), 5,23
                const amountMatch = line.match(/\$?\s*(\d+)[.,](\d{2})\b/);
                if (amountMatch) {
                    const amount = amountMatch[1] + '.' + amountMatch[2];
                    const taxAmount = parseFloat(amount);

                    if (taxAmount > 0 && taxAmount < 500) {
                        console.log('✅ [TAX DEBUG] Found tax amount:', amount);
                        return amount;
                    }
                }

                // Also try just finding any decimal number
                const numMatch = line.match(/(\d+\.\d+)/);
                if (numMatch) {
                    const taxAmount = parseFloat(numMatch[1]);
                    if (taxAmount > 0 && taxAmount < 100) {
                        console.log('✅ [TAX DEBUG] Found tax amount (fallback):', numMatch[1]);
                        // Format to 2 decimal places
                        return taxAmount.toFixed(2);
                    }
                }
            }
        }

        // Second pass: look for percentage-based tax
        for (const line of lines) {
            if (/\d+\.?\d*\s*%/.test(line)) {
                console.log('🔍 [TAX DEBUG] Found line with percentage:', line);

                const amountMatch = line.match(/\$?\s*(\d+)[.,](\d{2})\b/);
                if (amountMatch) {
                    const amount = amountMatch[1] + '.' + amountMatch[2];
                    console.log('✅ [TAX DEBUG] Found tax from % line:', amount);
                    return amount;
                }
            }
        }

        // Third pass: look for any line that ENDS with a small decimal amount after "tax"
        for (const line of lines) {
            const taxIdx = line.toLowerCase().indexOf('tax');
            if (taxIdx !== -1) {
                const afterTax = line.substring(taxIdx);
                const amounts = afterTax.match(/(\d+\.\d{2})/g);
                if (amounts && amounts.length > 0) {
                    const lastAmount = amounts[amounts.length - 1];
                    const taxAmount = parseFloat(lastAmount);
                    if (taxAmount > 0 && taxAmount < 100) {
                        console.log('✅ [TAX DEBUG] Found tax (last amount after "tax"):', lastAmount);
                        return lastAmount;
                    }
                }
            }
        }

        console.log('❌ [TAX DEBUG] No tax amount found');
        return "";
    }

    // Confidence scoring functions
    function merchantConfidence(v) {
        if (!v) return 0;
        if (v.length < 3) return 0.4;

        // Count letters
        const letters = v.replace(/[^A-Za-z]/g, "").length;

        // Low confidence if mostly numbers
        if (letters < v.length * 0.3) return 0.5;

        // Medium confidence if has unusual chars (except common ones)
        const allowedSpecial = /[&'\-\s0-9]/;
        const hasWeirdChars = v.split('').some(c => !allowedSpecial.test(c) && !/[A-Za-z]/.test(c));
        if (hasWeirdChars) return 0.7;

        // Good confidence if reasonable length and mostly letters
        return 0.9;
    }

    function totalConfidence(v) {
        if (!v) return 0;
        // Valid if it's a number with 2 decimal places
        if (/^\d+\.\d{2}$/.test(v)) return 0.95;
        // Partial confidence if at least looks like a number
        if (/\d+\.?\d*/.test(v)) return 0.7;
        return 0.5;
    }

    function dateConfidence(v) {
        if (!v) return 0;

        // Check if valid ISO format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 0.4;

        const d = new Date(v);
        if (isNaN(d.getTime())) return 0.4;

        // Future date is very suspicious
        if (d > new Date()) return 0.2;

        // Very old date (before 2000) is suspicious
        if (d.getFullYear() < 2000) return 0.3;

        return 0.9;
    }

    // Confidence-based UX helper
    function showStatus(input, confidence, fieldName) {
        if (!input) return;

        // Show or hide badge and hint
        const badge = document.getElementById(`${fieldName}-badge`);
        const hint = document.getElementById(`${fieldName}-hint`);

        if (confidence >= 0.85) {
            input.classList.remove("needs-review");
            input.classList.add("high-confidence");
        } else if (confidence >= 0.5) {
            input.classList.add("needs-review");
            if (hint) hint.textContent = "⚠️ Low confidence. Please verify.";
        } else if (confidence > 0) {
            input.classList.add("needs-review");
            if (hint) hint.textContent = "⚠️ Needs review. Please verify.";
        }

        // Show badge and hint if value was auto-filled
        if (badge && input.value) badge.style.display = 'inline-flex';
        if (hint && input.value) hint.style.display = 'block';
    }

    // Store AI suggestions for future improvement (data strategy)
    let aiSuggestions = {
        merchant: null,
        amount: null,
        tax: null,
        date: null
    };

    // Track user edits for learning
    function trackUserEdit(input, fieldName, originalValue) {
        input.addEventListener('input', function () {
            // Remove auto-fill styling when user edits
            input.classList.add('user-edited');

            // Store the edit for potential future ML training
            if (aiSuggestions[fieldName] !== null && input.value !== aiSuggestions[fieldName]) {
                console.log(`📝 User edited ${fieldName}: AI suggested "${aiSuggestions[fieldName]}" → User entered "${input.value}"`);

                // This data can be sent to backend later for ML improvement
                window.userEdits = window.userEdits || [];
                window.userEdits.push({
                    field: fieldName,
                    ai_suggestion: aiSuggestions[fieldName],
                    user_final: input.value,
                    timestamp: new Date().toISOString()
                });
            }
        }, { once: true }); // Only track first edit
    }

    // ========== GOOGLE VISION API OCR (PRO/PREMIUM USERS) ==========

    async function performOCRSpaceOCR(imageFile) {
        try {
            console.log('🤖 Using OCR.space API for OCR...');

            // Create form data
            const formData = new FormData();
            formData.append('image', imageFile);

            // Get auth token
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('No session found - please login again');
            }

            console.log('📡 Calling Edge Function...');

            // Call Supabase Edge Function
            const response = await fetch(
                `${SUPABASE_URL}/functions/v1/ocr-google`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: formData
                }
            );

            console.log('📥 Edge Function response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.error('❌ Edge Function error:', errorData);

                // Provide specific error messages
                if (response.status === 401) {
                    throw new Error('Authentication failed - please login again');
                } else if (response.status === 403) {
                    throw new Error('Access denied - upgrade to Pro for premium OCR');
                } else if (response.status === 429) {
                    throw new Error('Upload limit reached - upgrade your plan');
                } else if (response.status === 500) {
                    throw new Error(`Server error: ${errorData.error || 'OCR service unavailable'}`);
                } else {
                    throw new Error(errorData.message || errorData.error || 'OCR processing failed');
                }
            }

            const result = await response.json();
            console.log('✅ OCR.space result:', result);

            if (!result.success) {
                throw new Error(result.error || 'OCR processing failed');
            }

            return {
                success: true,
                data: result.data,
                usage: result.usage
            };
        } catch (error) {
            console.error('❌ OCR.space error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }


    // ========== OCR PROCESSING (ROUTES TO CORRECT ENGINE) ==========

    async function processReceiptWithOCR(imageFile) {
        const ocrLoading = document.getElementById('ocr-loading');
        const ocrProgressFill = document.getElementById('ocr-progress-fill');
        const ocrStatus = document.getElementById('ocr-status');

        try {
            // Show loading indicator
            ocrLoading.classList.add('active');
            ocrStatus.textContent = 'Preprocessing image...';
            ocrProgressFill.style.width = '5%';

            console.log('🔍 Starting OCR processing...');

            // Determine which OCR engine to use
            const useOCRSpace = userSubscriptionInfo && userSubscriptionInfo.ocr_engine === 'ocrspace';

            let extractedData = null;

            if (useOCRSpace) {
                // PRO/PREMIUM: Use OCR.space API
                ocrStatus.textContent = '🤖 Using premium OCR...';
                ocrProgressFill.style.width = '15%';

                const result = await performOCRSpaceOCR(imageFile);

                if (result.success) {
                    ocrProgressFill.style.width = '90%';
                    ocrStatus.textContent = 'Extracting data...';

                    extractedData = result.data;

                    // Update usage stats
                    if (result.usage) {
                        userSubscriptionInfo.monthly_upload_count = result.usage.count;
                        displayUsageStats(userSubscriptionInfo);
                    }
                } else {
                    throw new Error(result.error);
                }
            } else {
                // FREE: Use Tesseract OCR
                ocrStatus.textContent = '📝 Using basic OCR...';
                ocrProgressFill.style.width = '15%';

                // STEP 1: Preprocess image for better OCR accuracy
                const processedImage = await preprocessImage(imageFile);
                ocrProgressFill.style.width = '20%';
                ocrStatus.textContent = 'Initializing smart capture...';

                // STEP 2: Process image with Tesseract
                const result = await Tesseract.recognize(
                    processedImage,
                    'eng',
                    {
                        logger: function (m) {
                            if (m.status === 'recognizing text') {
                                const progress = Math.round(m.progress * 100);
                                ocrProgressFill.style.width = `${20 + (progress * 0.7)}%`;
                                ocrStatus.textContent = `Reading receipt... ${progress}%`;
                            }
                        }
                    }
                );

                ocrProgressFill.style.width = '90%';
                ocrStatus.textContent = 'Extracting data...';

                console.log('📄 OCR Text extracted:', result.data.text);

                // STEP 3: Parse using improved extraction functions
                const lines = getLines(result.data.text);
                console.log('📋 Parsed lines:', lines);

                const merchant = extractMerchant(lines);
                const total = extractTotal(lines);
                const date = extractDate(lines);
                const tax = extractTax(lines);

                extractedData = {
                    merchant: merchant || 'Unknown',
                    amount: total || '0.00',
                    date: date || new Date().toISOString().split('T')[0],
                    confidence: {
                        merchant: merchantConfidence(merchant),
                        amount: totalConfidence(total),
                        date: dateConfidence(date)
                    }
                };

                console.log('✅ Extracted data:', extractedData);
            }

            // Store AI suggestions for tracking
            aiSuggestions = {
                merchant: extractedData.merchant || null,
                amount: extractedData.amount || null,
                tax: null, // Tax not extracted by Google Vision yet
                date: extractedData.date || null
            };

            // STEP 4: Get form elements
            const merchantInput = document.getElementById('merchant-name');
            const amountInput = document.getElementById('amount');
            const dateInput = document.getElementById('receipt-date');
            const taxInput = document.getElementById('tax');
            const aiNotice = document.getElementById('ai-notice');

            let fieldsAutoFilled = 0;

            // Fill Merchant
            if (extractedData.merchant && extractedData.merchant !== 'Unknown') {
                merchantInput.value = extractedData.merchant;
                merchantInput.classList.add('auto-filled');
                showStatus(merchantInput, extractedData.confidence?.merchant || 0.9, 'merchant');
                trackUserEdit(merchantInput, 'merchant', extractedData.merchant);
                fieldsAutoFilled++;
            }

            // Fill Amount
            if (extractedData.amount && extractedData.amount !== '0.00') {
                amountInput.value = extractedData.amount;
                amountInput.classList.add('auto-filled');
                showStatus(amountInput, extractedData.confidence?.amount || 0.9, 'amount');
                trackUserEdit(amountInput, 'amount', extractedData.amount);
                fieldsAutoFilled++;
            }

            // Fill Date
            if (extractedData.date) {
                dateInput.value = extractedData.date;
                dateInput.classList.add('auto-filled');
                showStatus(dateInput, extractedData.confidence?.date || 0.9, 'date');
                trackUserEdit(dateInput, 'date', extractedData.date);
                fieldsAutoFilled++;
            }

            // Fill Tax
            if (taxInput) {
                if (tax) {
                    taxInput.value = tax;
                    taxInput.classList.add('auto-filled');
                    showStatus(taxInput, 0.9, 'tax');
                    trackUserEdit(taxInput, 'tax', tax);
                    fieldsAutoFilled++;
                } else {
                    showStatus(taxInput, 0.4, 'tax');
                }
            }

            // STEP 5: Show AI notice if any fields were auto-filled
            if (fieldsAutoFilled > 0 && aiNotice) {
                aiNotice.style.display = 'flex';
            }

            // Success message based on how much was detected
            ocrProgressFill.style.width = '100%';
            if (fieldsAutoFilled >= 3) {
                ocrStatus.textContent = '✅ Receipt captured successfully!';
                ocrStatus.style.color = '#059669';
            } else if (fieldsAutoFilled > 0) {
                ocrStatus.textContent = '✅ Partial data captured. Please complete missing fields.';
                ocrStatus.style.color = '#d97706';
            } else {
                ocrStatus.textContent = '⚠️ Could not detect data. Please enter manually.';
                ocrStatus.style.color = '#DC2626';
            }

            // Show form
            document.getElementById('receipt-form').style.display = 'block';

            // Hide loading
            setTimeout(function () {
                ocrLoading.classList.remove('active');
            }, 1500);

        } catch (error) {
            console.error('❌ OCR error:', error);

            // CRITICAL: For Pro users, show detailed error and offer fallback
            if (userSubscriptionInfo && userSubscriptionInfo.ocr_engine === 'ocrspace') {
                console.error('🚨 PREMIUM OCR FAILED:', error.message);

                // Show detailed error to help debug
                ocrStatus.innerHTML = `
                    <div style="text-align: left;">
                        <div style="color: #DC2626; font-weight: 600; margin-bottom: 0.5rem;">⚠️ Premium OCR Unavailable</div>
                        <div style="color: #6B7280; font-size: 0.875rem; margin-bottom: 0.5rem;">
                            Error: ${error.message}
                        </div>
                        <div style="color: #059669; font-size: 0.875rem;">
                            ✓ Falling back to basic OCR...
                        </div>
                    </div>
                `;

                // FALLBACK: Try Tesseract as backup for Pro users
                try {
                    ocrProgressFill.style.width = '20%';
                    console.log('🔄 Attempting fallback to Tesseract OCR...');

                    // Preprocess image
                    const processedImage = await preprocessImage(imageFile);
                    ocrProgressFill.style.width = '30%';

                    // Process with Tesseract
                    const { data: { text } } = await Tesseract.recognize(
                        processedImage,
                        'eng',
                        {
                            logger: m => {
                                if (m.status === 'recognizing text') {
                                    const progress = Math.floor(m.progress * 60) + 30;
                                    ocrProgressFill.style.width = progress + '%';
                                }
                            }
                        }
                    );

                    ocrProgressFill.style.width = '90%';

                    // Parse the text
                    const lines = getLines(text);
                    const merchant = extractMerchant(lines);
                    const total = extractTotal(lines);
                    const date = extractDate(lines);
                    const tax = extractTax(lines);

                    const extractedData = {
                        merchant,
                        amount: total,
                        date,
                        confidence: {
                            merchant: merchantConfidence(merchant),
                            amount: totalConfidence(total),
                            date: dateConfidence(date)
                        }
                    };

                    // Fill form with fallback data
                    fillFormWithOCRData(extractedData, tax);

                    ocrProgressFill.style.width = '100%';
                    ocrStatus.innerHTML = `
                        <div style="color: #059669;">
                            ✅ Fallback OCR completed successfully!
                        </div>
                    `;

                    document.getElementById('receipt-form').style.display = 'block';

                    setTimeout(() => {
                        ocrLoading.classList.remove('active');
                    }, 1500);

                    return; // Exit successfully

                } catch (fallbackError) {
                    console.error('❌ Fallback OCR also failed:', fallbackError);
                    ocrStatus.innerHTML = `
                        <div style="color: #DC2626;">
                            ⚠️ Both OCR methods failed. Please enter details manually.
                        </div>
                    `;
                }
            } else {
                // Free user error (less critical)
                ocrStatus.textContent = '⚠️ Smart capture unavailable. Please enter details manually.';
                ocrStatus.style.color = '#DC2626';
            }

            // Show form for manual entry
            document.getElementById('receipt-form').style.display = 'block';

            setTimeout(function () {
                ocrLoading.classList.remove('active');
            }, 2000);
        }
    }

    // Helper function to fill form with OCR data (extracted for reuse)
    function fillFormWithOCRData(extractedData, tax) {
        const merchantInput = document.getElementById('merchant-name');
        const amountInput = document.getElementById('amount');
        const dateInput = document.getElementById('receipt-date');
        const taxInput = document.getElementById('tax');
        const aiNotice = document.getElementById('ai-notice');

        let fieldsAutoFilled = 0;

        // Store AI suggestions for tracking
        aiSuggestions = {
            merchant: extractedData.merchant || null,
            amount: extractedData.amount || null,
            tax: tax || null,
            date: extractedData.date || null
        };

        // Fill Merchant
        if (extractedData.merchant && extractedData.merchant !== 'Unknown') {
            merchantInput.value = extractedData.merchant;
            merchantInput.classList.add('auto-filled');
            showStatus(merchantInput, extractedData.confidence?.merchant || 0.9, 'merchant');
            trackUserEdit(merchantInput, 'merchant', extractedData.merchant);
            fieldsAutoFilled++;
        }

        // Fill Amount
        if (extractedData.amount && extractedData.amount !== '0.00') {
            amountInput.value = extractedData.amount;
            amountInput.classList.add('auto-filled');
            showStatus(amountInput, extractedData.confidence?.amount || 0.9, 'amount');
            trackUserEdit(amountInput, 'amount', extractedData.amount);
            fieldsAutoFilled++;
        }

        // Fill Date
        if (extractedData.date) {
            dateInput.value = extractedData.date;
            dateInput.classList.add('auto-filled');
            showStatus(dateInput, extractedData.confidence?.date || 0.9, 'date');
            trackUserEdit(dateInput, 'date', extractedData.date);
            fieldsAutoFilled++;
        }

        // Fill Tax
        if (taxInput) {
            if (tax) {
                taxInput.value = tax;
                taxInput.classList.add('auto-filled');
                showStatus(taxInput, 0.9, 'tax');
                trackUserEdit(taxInput, 'tax', tax);
                fieldsAutoFilled++;
            } else {
                showStatus(taxInput, 0.4, 'tax');
            }
        }

        // Show AI notice if any fields were auto-filled
        if (fieldsAutoFilled > 0 && aiNotice) {
            aiNotice.style.display = 'flex';
        }

        return fieldsAutoFilled;
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
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = 'Preview';
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';
                    previewItem.appendChild(img);

                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'remove-btn';
                    removeBtn.textContent = '×';
                    removeBtn.onclick = function () { window.uploadFunctions.removeFile(index); };
                    previewItem.appendChild(removeBtn);
                } else {
                    const placeholder = document.createElement('div');
                    placeholder.style.cssText = 'height: 150px; display: flex; align-items: center; justify-content: center; background: #f3f4f6;';
                    const icon = document.createElement('span');
                    icon.style.cssText = 'font-size: 2rem;';
                    icon.textContent = '📄';
                    placeholder.appendChild(icon);
                    previewItem.appendChild(placeholder);

                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'remove-btn';
                    removeBtn.textContent = '×';
                    removeBtn.onclick = function () { window.uploadFunctions.removeFile(index); };
                    previewItem.appendChild(removeBtn);
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
        const taxAmount = parseFloat(document.getElementById('tax').value) || 0;
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
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="btn-icon">⏳</span> Saving...';

        try {
            console.log('📤 Uploading receipt...');
            const { data: { user } } = await supabase.auth.getUser();

            // Upload files
            const filePaths = [];
            for (const file of selectedFiles) {
                const fileExt = file.name.split('.').pop();
                const sanitizedName = SecurityUtils.sanitizeFilename(file.name);
                const randomPart = Math.random().toString(36).substr(2, 9);
                const fileName = `${user.id}/${Date.now()}_${randomPart}.${fileExt}`;

                const { data, error } = await supabase.storage
                    .from('receipts')
                    .upload(fileName, file);

                if (error) throw error;
                filePaths.push(data.path);
            }

            // Prepare the receipt data
            // NOTE: Ensure you have run ADD_TAX_COLUMN.sql to add the tax_amount column
            // Fallback: If migration not run, we append tax to notes so it's not lost
            const finalNotes = taxAmount > 0
                ? (notes ? `${notes} [Tax: $${taxAmount.toFixed(2)}]` : `[Tax: $${taxAmount.toFixed(2)}]`)
                : notes;

            const receiptData = {
                user_id: user.id,
                merchant_name: merchantName,
                amount: amount,
                // tax_amount: taxAmount, // Column not in DB yet
                receipt_date: receiptDate,
                file_path: filePaths.join(','),
                notes: finalNotes,
                is_business: isBusiness
            };

            // Log AI tracking data to console (for debugging & future use)
            // Note: This data can be sent to a separate tracking table in the future
            if (aiSuggestions.merchant !== null || aiSuggestions.amount !== null) {
                const aiTrackingData = {
                    suggestions: aiSuggestions,
                    user_edits: window.userEdits || [],
                    was_auto_filled: true,
                    tax_detected: taxAmount || 0
                };
                console.log('📊 AI Tracking Data (console only - not saved to DB):', aiTrackingData);
                console.log('💡 To save this data, add an ai_tracking table or ai_data column to receipts table');
            }

            // Save receipt metadata to database
            const { error: dbError } = await supabase
                .from('receipts')
                .insert(receiptData);

            if (dbError) {
                console.error('Database error:', dbError);
                throw new Error(dbError.message || 'Failed to save receipt');
            }

            console.log('✅ Receipt saved successfully');
            showMessage('Receipt saved successfully!', 'success');

            // Clear AI tracking
            aiSuggestions = { merchant: null, amount: null, tax: null, date: null };
            window.userEdits = [];

            // Redirect to dashboard
            setTimeout(function () {
                window.location.href = '/dashboard.html';
            }, 1500);

        } catch (error) {
            console.error('❌ Upload error:', error);
            showMessage(error.message, 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
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
