// Currency Formatting Utility for Reciptera
// Handles USD and INR formatting with proper symbols and number formats

const CurrencyFormatter = {
    /**
     * Format amount based on currency
     * @param {number} amount - The amount to format
     * @param {string} currency - 'USD' or 'INR'
     * @returns {string} Formatted currency string
     */
    format(amount, currency = 'USD') {
        const symbol = this.getSymbol(currency);
        const formatted = this.formatNumber(amount, currency);
        return symbol + formatted;
    },

    /**
     * Format number based on currency locale
     * @param {number} amount - The amount to format
     * @param {string} currency - 'USD' or 'INR'
     * @returns {string} Formatted number
     */
    formatNumber(amount, currency = 'USD') {
        const locale = currency === 'INR' ? 'en-IN' : 'en-US';
        return parseFloat(amount).toLocaleString(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },

    /**
     * Get currency symbol
     * @param {string} currency - 'USD' or 'INR'
     * @returns {string} Currency symbol
     */
    getSymbol(currency = 'USD') {
        return currency === 'INR' ? '₹' : '$';
    },

    /**
     * Get currency name
     * @param {string} currency - 'USD' or 'INR'
     * @returns {string} Currency name
     */
    getName(currency = 'USD') {
        return currency === 'INR' ? 'Indian Rupee' : 'US Dollar';
    },

    /**
     * Parse formatted currency string to number
     * @param {string} formattedAmount - Formatted currency string
     * @returns {number} Parsed number
     */
    parse(formattedAmount) {
        // Remove currency symbols and commas
        return parseFloat(formattedAmount.replace(/[₹$,]/g, ''));
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.CurrencyFormatter = CurrencyFormatter;
}
