/**
 * Reviews Module
 * Manages book reviews using localStorage
 */

// Reviews storage key prefix
const REVIEWS_STORAGE_KEY_PREFIX = 'kitapsever_reviews_';

/**
 * Get reviews for a book
 * @param {string} bookId - Book ID
 * @returns {Array} - Array of review objects
 */
export const getReviews = (bookId) => {
    const storageKey = REVIEWS_STORAGE_KEY_PREFIX + bookId;
    const storedReviews = localStorage.getItem(storageKey);
    return storedReviews ? JSON.parse(storedReviews) : [];
};

/**
 * Add review to storage
 * @param {string} bookId - Book ID
 * @param {Object} review - Review object
 */
export const addReviewToStorage = (bookId, review) => {
    const reviews = getReviews(bookId);
    reviews.push(review);
    
    const storageKey = REVIEWS_STORAGE_KEY_PREFIX + bookId;
    localStorage.setItem(storageKey, JSON.stringify(reviews));
};

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
