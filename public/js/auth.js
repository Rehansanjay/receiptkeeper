(function () {
    'use strict';

    // Initialize Supabase client
    const SUPABASE_URL = 'https://hiscskqwlgavicihsote.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpc2Nza3F3bGdhdmljaWhzb3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDc2MDMsImV4cCI6MjA4NDk4MzYwM30.Acu9LBOgIa_kLlm4gcDb06Dw8cwxnYxeyr_gI7PweL8';

    // Check if Supabase library is loaded
    if (typeof window.supabase === 'undefined') {
        console.error('CRITICAL ERROR: Supabase library not loaded!');
        alert('Error: Supabase library failed to load. Please refresh the page.');
        return;
    }

    // Get or create Supabase client
    const supabase = window.supabaseClient || window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    if (!window.supabaseClient) {
        window.supabaseClient = supabase;
        console.log('✅ Supabase client initialized');
    } else {
        console.log('✅ Using existing Supabase client');
    }

    // ========== PASSWORD SECURITY CONFIGURATION ==========
    const passwordRequirements = {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
    };

    // Password validation function
    function validatePassword(password) {
        const errors = [];

        if (password.length < passwordRequirements.minLength) {
            errors.push(`At least ${passwordRequirements.minLength} characters`);
        }

        if (passwordRequirements.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('One uppercase letter (A-Z)');
        }

        if (passwordRequirements.requireLowercase && !/[a-z]/.test(password)) {
            errors.push('One lowercase letter (a-z)');
        }

        if (passwordRequirements.requireNumbers && !/[0-9]/.test(password)) {
            errors.push('One number (0-9)');
        }

        if (passwordRequirements.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('One special character (!@#$%^&* etc.)');
        }

        return errors;
    }

    // Calculate password strength
    function getPasswordStrength(password) {
        const errors = validatePassword(password);

        if (password.length === 0) return { level: 'none', text: '', className: '' };
        if (errors.length === 0) return { level: 'strong', text: '✓ Strong password', className: 'strong' };
        if (errors.length <= 2) return { level: 'medium', text: '⚠ Medium strength', className: 'medium' };
        return { level: 'weak', text: '✗ Weak password', className: 'weak' };
    }

    // Signup Form Handler
    document.addEventListener('DOMContentLoaded', function () {
        if (typeof SecurityUtils !== 'undefined') {
            SecurityUtils.enforceHTTPS();
        }

        const signupForm = document.getElementById('signup-form');

        if (signupForm) {
            // Real-time password strength indicator
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                passwordInput.addEventListener('input', function (e) {
                    const password = e.target.value;
                    const errors = validatePassword(password);
                    const strength = getPasswordStrength(password);
                    const strengthIndicator = document.getElementById('password-strength');
                    const requirementsList = document.getElementById('password-requirements');

                    if (strengthIndicator) {
                        strengthIndicator.textContent = strength.text;
                        strengthIndicator.className = 'password-strength ' + strength.className;
                    }

                    // Update requirements checklist
                    if (requirementsList) {
                        const requirements = [
                            { id: 'req-length', check: password.length >= passwordRequirements.minLength, text: `${passwordRequirements.minLength}+ characters` },
                            { id: 'req-uppercase', check: /[A-Z]/.test(password), text: 'Uppercase letter' },
                            { id: 'req-lowercase', check: /[a-z]/.test(password), text: 'Lowercase letter' },
                            { id: 'req-number', check: /[0-9]/.test(password), text: 'Number' },
                            { id: 'req-special', check: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), text: 'Special character' }
                        ];

                        requirementsList.innerHTML = requirements.map(req =>
                            `<li class="${req.check ? 'met' : 'unmet'}">${req.check ? '✓' : '○'} ${req.text}</li>`
                        ).join('');
                    }
                });
            }

            // Form submission handler
            signupForm.addEventListener('submit', async function (e) {
                e.preventDefault();

                const fullName = document.getElementById('full-name').value.trim();
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value;
                const businessName = document.getElementById('business-name').value.trim();

                // Validate password before submitting
                const passwordErrors = validatePassword(password);
                if (passwordErrors.length > 0) {
                    showMessage('Password must have: ' + passwordErrors.join(', '), 'error');
                    return;
                }

                const button = signupForm.querySelector('button[type="submit"]');
                button.disabled = true;
                button.textContent = 'Creating account...';

                try {
                    console.log('📝 Attempting sign-up:', { email, fullName, businessName });

                    const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                full_name: fullName,
                                business_name: businessName
                            }
                        }
                    });

                    console.log('📬 Sign-up response:', { data, error });

                    if (error) throw error;

                    // Check if email confirmation is required
                    if (data?.user && !data?.session) {
                        showMessage('Please check your email to confirm your account.', 'success');
                        button.disabled = false;
                        button.textContent = 'Create Account';
                        return;
                    }

                    // Show success message
                    showMessage('Account created! Redirecting to dashboard...', 'success');

                    // Redirect to dashboard
                    setTimeout(function () {
                        window.location.href = '/dashboard.html';
                    }, 2000);

                } catch (error) {
                    console.error('❌ Sign-up error:', error);
                    showMessage(error.message || 'Failed to create account. Please try again.', 'error');
                    button.disabled = false;
                    button.textContent = 'Create Account';
                }
            });
        }
    });

    function showMessage(message, type) {
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.className = type === 'error' ? 'error-message' : 'success-message';
            errorDiv.style.display = 'block';
        }
    }

})();
