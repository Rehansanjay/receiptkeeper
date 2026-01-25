// Initialize Supabase client
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your anon key

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Signup Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fullName = document.getElementById('full-name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const businessName = document.getElementById('business-name').value;
            
            const button = signupForm.querySelector('button[type="submit"]');
            button.disabled = true;
            button.textContent = 'Creating account...';
            
            try {
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
                
                if (error) throw error;
                
                // Show success message
                showMessage('Account created! Redirecting to dashboard...', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 2000);
                
            } catch (error) {
                showMessage(error.message, 'error');
                button.disabled = false;
                button.textContent = 'Create Account';
            }
        });
    }
});

function showMessage(message, type) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.className = type === 'error' ? 'error-message' : 'success-message';
    errorDiv.style.display = 'block';
}
