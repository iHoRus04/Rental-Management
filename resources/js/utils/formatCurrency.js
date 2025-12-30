/**
 * Format currency in Vietnamese format without decimal places
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string (e.g., "5.000.000")
 */
export const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString('vi-VN', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
    });
};
