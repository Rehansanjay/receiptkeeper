/**
 * Reciptera - Supabase Configuration
 * Centralized configuration to prevent redeclaration errors
 */

(function () {
    'use strict';

    // Prevent multiple initializations
    if (window.Reciptera) {
        console.log('Reciptera already initialized');
        return;
    }

    // Configuration
    const CONFIG = {
        supabaseUrl: 'https://hiscskqwlgavicihsote.supabase.co',
        supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpc2Nza3F3bGdhdmljaWhzb3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDc2MDMsImV4cCI6MjA4NDk4MzYwM30.Acu9LBOgIa_kLlm4gcDb06Dw8cwxnYxeyr_gI7PweL8'
    };

    // Check if Supabase library is loaded
    if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase library not loaded');
        return;
    }

    // Create single Supabase client
    const supabaseClient = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);

    // Global Reciptera object
    window.Reciptera = {
        supabase: supabaseClient,
        config: CONFIG,

        // Helper methods
        async getSession() {
            const { data: { session } } = await supabaseClient.auth.getSession();
            return session;
        },

        async getUser() {
            const { data: { user } } = await supabaseClient.auth.getUser();
            return user;
        },

        async signOut() {
            await supabaseClient.auth.signOut();
        },

        // Logging helpers
        log: {
            success: (msg) => console.log('✅', msg),
            error: (msg) => console.error('❌', msg),
            info: (msg) => console.log('📝', msg),
            warn: (msg) => console.warn('⚠️', msg)
        }
    };

    console.log('✅ Reciptera initialized');

})();
