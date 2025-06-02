/**
 * Google Books API Integration
 * This file handles all interactions with the Google Books API
 */

// API Key (normally would be stored securely)
const API_KEY = '';  // No API key needed for client-side requests with proper referrer restrictions

// Base URL for Google Books API
const API_BASE_URL = 'https://www.googleapis.com/books/v1';

/**
 * Search books by query
 * @param {string} query - Search query
 * @param {number} startIndex - Starting index for pagination
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise} - Promise with search results
 */
function searchBooks(query, startIndex = 0, maxResults = 10) {
    const url = `${API_BASE_URL}/volumes?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${maxResults}`;
    
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error fetching books:', error);
            throw error;
        });
}

/**
 * Search books by category
 * @param {string} category - Category to search for
 * @param {number} startIndex - Starting index for pagination
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise} - Promise with search results
 */
function searchBooksByCategory(category, startIndex = 0, maxResults = 10) {
    const url = `${API_BASE_URL}/volumes?q=subject:${encodeURIComponent(category)}&startIndex=${startIndex}&maxResults=${maxResults}`;
    
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error fetching books by category:', error);
            throw error;
        });
}

/**
 * Get book details by ID
 * @param {string} bookId - Book ID
 * @returns {Promise} - Promise with book details
 */
function getBookDetails(bookId) {
    const url = `${API_BASE_URL}/volumes/${bookId}`;
    
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error fetching book details:', error);
            throw error;
        });
}

/**
 * Get featured books (bestsellers or popular books)
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise} - Promise with featured books
 */
function getFeaturedBooks(maxResults = 8) {
    // Using a predefined query to get popular books
    const url = `${API_BASE_URL}/volumes?q=subject:fiction&orderBy=relevance&maxResults=${maxResults}`;
    
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error fetching featured books:', error);
            throw error;
        });
}

/**
 * Get book cover image URL
 * @param {Object} volumeInfo - Volume info object from Google Books API
 * @param {string} size - Size of the cover image (small, medium, large)
 * @returns {string} - URL of the cover image or placeholder if not available
 */
function getBookCoverUrl(volumeInfo, size = 'thumbnail') {
    if (volumeInfo && volumeInfo.imageLinks && volumeInfo.imageLinks[size]) {
        // Replace http with https to avoid mixed content warnings
        return volumeInfo.imageLinks[size].replace('http://', 'https://');
    }
    
    // Return placeholder image if no cover is available
    return 'https://via.placeholder.com/128x192?text=No+Cover';
}

/**
 * Format book data for display
 * @param {Object} book - Book object from Google Books API
 * @returns {Object} - Formatted book data
 */
function formatBookData(book) {
    const volumeInfo = book.volumeInfo || {};
    
    return {
        id: book.id,
        title: volumeInfo.title || 'Başlık Yok',
        authors: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Yazar Bilinmiyor',
        description: volumeInfo.description || 'Bu kitap için açıklama bulunmamaktadır.',
        coverUrl: getBookCoverUrl(volumeInfo),
        largeCoverUrl: getBookCoverUrl(volumeInfo, 'thumbnail'),
        publishedDate: volumeInfo.publishedDate || 'Yayın tarihi bilinmiyor',
        publisher: volumeInfo.publisher || 'Yayıncı bilinmiyor',
        pageCount: volumeInfo.pageCount || 'Bilinmiyor',
        categories: volumeInfo.categories ? volumeInfo.categories.join(', ') : 'Kategori bilinmiyor',
        language: volumeInfo.language || 'Bilinmiyor',
        previewLink: volumeInfo.previewLink || '',
        averageRating: volumeInfo.averageRating || 0,
        ratingsCount: volumeInfo.ratingsCount || 0
    };
}

// Export functions for use in main.js
window.bookApi = {
    searchBooks,
    searchBooksByCategory,
    getBookDetails,
    getFeaturedBooks,
    getBookCoverUrl,
    formatBookData
};
