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

    // Signup Form Handler
    document.addEventListener('DOMContentLoaded', function () {
        const signupForm = document.getElementById('signup-form');

        if (signupForm) {
            signupForm.addEventListener('submit', async function (e) {
                e.preventDefault();

                const fullName = document.getElementById('full-name').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const businessName = document.getElementById('business-name').value;

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
