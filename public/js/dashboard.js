// Dashboard - Uses centralized Reciptera config
(function () {
    'use strict';

    const supabase = Reciptera.supabase;
    const log = Reciptera.log;

    let allReceipts = [];
    let currentUser = null;

    // Initialize dashboard
    document.addEventListener('DOMContentLoaded', async function () {
        log.info('Dashboard loading...');

        // Check authentication
        const session = await Reciptera.getSession();
        if (!session) {
            log.error('No session found, redirecting to login');
            window.location.href = '/login.html';
            return;
        }

        currentUser = session.user;
        log.success('User authenticated: ' + currentUser.email);

        await loadProfile();
        await loadReceipts();
        setupFilters();
        setupLogout();
        setupExport();
    });

    async function loadProfile() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .single();

            if (error) throw error;

            if (data) {
                const name = data.full_name || data.business_name || 'User';
                document.getElementById('welcome-message').textContent = `Welcome back, ${name}!`;
                log.success('Profile loaded: ' + name);
            }
        } catch (error) {
            log.warn('Error loading profile: ' + error.message);
        }
    }

    async function loadReceipts() {
        try {
            const { data, error } = await supabase
                .from('receipts')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('receipt_date', { ascending: false });

            if (error) throw error;

            allReceipts = data || [];
            log.success(`Loaded ${allReceipts.length} receipts`);

            updateStats();
            displayReceipts(allReceipts);
            populateYearFilter();
        } catch (error) {
            log.error('Error loading receipts: ' + error.message);
            showEmptyState('Error loading receipts. Please try again.');
        }
    }

    function updateStats() {
        const totalReceipts = allReceipts.length;
        const totalAmount = allReceipts.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
        const businessAmount = allReceipts
            .filter(r => r.is_business)
            .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

        const now = new Date();
        const thisMonth = allReceipts.filter(r => {
            const receiptDate = new Date(r.receipt_date);
            return receiptDate.getMonth() === now.getMonth() &&
                receiptDate.getFullYear() === now.getFullYear();
        }).length;

        document.getElementById('total-receipts').textContent = totalReceipts;
        document.getElementById('total-amount').textContent = `$${totalAmount.toFixed(2)}`;
        document.getElementById('month-receipts').textContent = thisMonth;
        document.getElementById('business-amount').textContent = `$${businessAmount.toFixed(2)}`;
    }

    function displayReceipts(receipts) {
        const container = document.getElementById('receipts-container');

        if (receipts.length === 0) {
            showEmptyState();
            return;
        }

        container.innerHTML = receipts.map(receipt => {
            const date = new Date(receipt.receipt_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            return `
                <div class="receipt-card">
                    <div class="receipt-thumbnail-placeholder" style="width: 80px; height: 80px; background: #e5e7eb; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 2rem;">
                        🧾
                    </div>
                    <div class="receipt-info">
                        <h3>${receipt.merchant_name}</h3>
                        <div class="meta">
                            ${date} • ${receipt.is_business ? 'Business' : 'Personal'}
                        </div>
                        ${receipt.notes ? `<div class="meta">${receipt.notes}</div>` : ''}
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
                        <div class="receipt-amount">$${parseFloat(receipt.amount).toFixed(2)}</div>
                        <div class="receipt-actions">
                            <button class="icon-btn" onclick="window.dashboardFunctions.viewReceipt('${receipt.id}')" title="View">👁️</button>
                            <button class="icon-btn" onclick="window.dashboardFunctions.deleteReceipt('${receipt.id}')" title="Delete">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function showEmptyState(message = null) {
        const container = document.getElementById('receipts-container');
        container.innerHTML = `
            <div class="empty-state">
                <h2>${message || 'No receipts yet'}</h2>
                <p>${message || 'Start uploading your receipts to keep track of your expenses'}</p>
                ${!message ? '<a href="/upload.html" class="cta-button">Upload First Receipt</a>' : ''}
            </div>
        `;
    }

    function setupFilters() {
        document.getElementById('year-filter').addEventListener('change', applyFilters);
        document.getElementById('month-filter').addEventListener('change', applyFilters);
        document.getElementById('search-input').addEventListener('input', applyFilters);
    }

    function populateYearFilter() {
        const years = [...new Set(allReceipts.map(r => new Date(r.receipt_date).getFullYear()))];
        years.sort((a, b) => b - a);

        const yearFilter = document.getElementById('year-filter');
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
    }

    function applyFilters() {
        const year = document.getElementById('year-filter').value;
        const month = document.getElementById('month-filter').value;
        const search = document.getElementById('search-input').value.toLowerCase();

        let filtered = allReceipts;

        if (year) {
            filtered = filtered.filter(r => new Date(r.receipt_date).getFullYear() == year);
        }

        if (month) {
            filtered = filtered.filter(r => new Date(r.receipt_date).getMonth() + 1 == month);
        }

        if (search) {
            filtered = filtered.filter(r =>
                r.merchant_name.toLowerCase().includes(search) ||
                (r.notes && r.notes.toLowerCase().includes(search))
            );
        }

        displayReceipts(filtered);
    }

    async function viewReceipt(id) {
        const receipt = allReceipts.find(r => r.id === id);
        if (!receipt) return;

        alert(`Receipt Details:\n\nMerchant: ${receipt.merchant_name}\nAmount: $${receipt.amount}\nDate: ${receipt.receipt_date}\nType: ${receipt.is_business ? 'Business' : 'Personal'}\nNotes: ${receipt.notes || 'None'}`);
    }

    async function deleteReceipt(id) {
        if (!confirm('Are you sure you want to delete this receipt?')) return;

        try {
            const { error } = await supabase
                .from('receipts')
                .delete()
                .eq('id', id);

            if (error) throw error;

            log.success('Receipt deleted');
            await loadReceipts();
        } catch (error) {
            log.error('Error deleting receipt: ' + error.message);
            alert('Error deleting receipt. Please try again.');
        }
    }

    function setupLogout() {
        document.getElementById('logout-btn').addEventListener('click', async function (e) {
            e.preventDefault();
            log.info('Logging out...');
            await Reciptera.signOut();
            window.location.href = '/';
        });
    }

    function setupExport() {
        document.getElementById('export-btn').addEventListener('click', exportTaxPackage);
    }

    async function exportTaxPackage() {
        if (allReceipts.length === 0) {
            alert('No receipts to export');
            return;
        }

        const businessReceipts = allReceipts.filter(r => r.is_business);
        const csv = generateCSV(businessReceipts);

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipts_${new Date().getFullYear()}.csv`;
        a.click();

        log.success(`Exported ${businessReceipts.length} business receipts`);
        alert(`Exported ${businessReceipts.length} business receipts to CSV`);
    }

    function generateCSV(receipts) {
        const headers = ['Date', 'Merchant', 'Amount', 'Notes'];
        const rows = receipts.map(r => [
            r.receipt_date,
            r.merchant_name,
            r.amount,
            r.notes || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return csvContent;
    }

    // Expose functions for onclick handlers
    window.dashboardFunctions = {
        viewReceipt,
        deleteReceipt
    };

})();
