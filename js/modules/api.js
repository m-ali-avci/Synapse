/**
 * Google Books API Integration Module
 * This module handles all interactions with the Google Books API
 */

// Base URL for Google Books API
const API_BASE_URL = 'https://www.googleapis.com/books/v1';

/**
 * Search books by query
 * @param {string} query - Search query
 * @param {number} startIndex - Starting index for pagination
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise} - Promise with search results
 */
export const searchBooks = (query, startIndex = 0, maxResults = 10) => {
    // Check if we have cached results
    const cacheKey = `book_search_${query}_${startIndex}_${maxResults}`;
    const cachedResults = getCachedData(cacheKey);
    
    if (cachedResults) {
        console.log('Using cached search results');
        return Promise.resolve(cachedResults);
    }
    
    const url = `${API_BASE_URL}/volumes?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${maxResults}`;
    
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Cache the results
            cacheData(cacheKey, data, 3600); // Cache for 1 hour
            return data;
        })
        .catch(error => {
            console.error('Error fetching books:', error);
            throw error;
        });
};

/**
 * Search books by category
 * @param {string} category - Category to search for
 * @param {number} startIndex - Starting index for pagination
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise} - Promise with search results
 */
export const searchBooksByCategory = (category, startIndex = 0, maxResults = 10) => {
    // Check if we have cached results
    const cacheKey = `book_category_${category}_${startIndex}_${maxResults}`;
    const cachedResults = getCachedData(cacheKey);
    
    if (cachedResults) {
        console.log('Using cached category results');
        return Promise.resolve(cachedResults);
    }
    
    const url = `${API_BASE_URL}/volumes?q=subject:${encodeURIComponent(category)}&startIndex=${startIndex}&maxResults=${maxResults}`;
    
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Cache the results
            cacheData(cacheKey, data, 3600); // Cache for 1 hour
            return data;
        })
        .catch(error => {
            console.error('Error fetching books by category:', error);
            throw error;
        });
};

/**
 * Get book details by ID
 * @param {string} bookId - Book ID
 * @returns {Promise} - Promise with book details
 */
export const getBookDetails = (bookId) => {
    // Check if we have cached results
    const cacheKey = `book_details_${bookId}`;
    const cachedResults = getCachedData(cacheKey);
    
    if (cachedResults) {
        console.log('Using cached book details');
        return Promise.resolve(cachedResults);
    }
    
    const url = `${API_BASE_URL}/volumes/${bookId}`;
    
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Cache the results
            cacheData(cacheKey, data, 86400); // Cache for 24 hours
            return data;
        })
        .catch(error => {
            console.error('Error fetching book details:', error);
            throw error;
        });
};

/**
 * Get featured books (bestsellers or popular books)
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise} - Promise with featured books
 */
export const getFeaturedBooks = (maxResults = 8) => {
    // Check if we have cached results
    const cacheKey = `featured_books_${maxResults}`;
    const cachedResults = getCachedData(cacheKey);
    
    if (cachedResults) {
        console.log('Using cached featured books');
        return Promise.resolve(cachedResults);
    }
    
    // Using a predefined query to get popular books
    const url = `${API_BASE_URL}/volumes?q=subject:fiction&orderBy=relevance&maxResults=${maxResults}`;
    
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Cache the results
            cacheData(cacheKey, data, 43200); // Cache for 12 hours
            return data;
        })
        .catch(error => {
            console.error('Error fetching featured books:', error);
            throw error;
        });
};

/**
 * Get book cover image URL
 * @param {Object} volumeInfo - Volume info object from Google Books API
 * @param {string} size - Size of the cover image (small, medium, large)
 * @returns {string} - URL of the cover image or placeholder if not available
 */
export const getBookCoverUrl = (volumeInfo, size = 'thumbnail') => {
    if (volumeInfo && volumeInfo.imageLinks && volumeInfo.imageLinks[size]) {
        // Replace http with https to avoid mixed content warnings
        return volumeInfo.imageLinks[size].replace('http://', 'https://');
    }
    
    // Return placeholder image if no cover is available
    return 'https://via.placeholder.com/128x192?text=No+Cover';
};

/**
 * Format book data for display
 * @param {Object} book - Book object from Google Books API
 * @returns {Object} - Formatted book data
 */
export const formatBookData = (book) => {
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
};

/**
 * Cache data in localStorage with expiration
 * @param {string} key - Cache key
 * @param {Object} data - Data to cache
 * @param {number} expirationInSeconds - Cache expiration time in seconds
 */
const cacheData = (key, data, expirationInSeconds) => {
    const cacheItem = {
        data: data,
        expiration: Date.now() + (expirationInSeconds * 1000)
    };
    
    try {
        localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (e) {
        // Handle localStorage errors (e.g., quota exceeded)
        console.warn('Could not cache data:', e);
        cleanupCache(); // Try to clean up old cache entries
    }
};

/**
 * Get cached data if not expired
 * @param {string} key - Cache key
 * @returns {Object|null} - Cached data or null if not found or expired
 */
const getCachedData = (key) => {
    try {
        const cacheItem = localStorage.getItem(key);
        
        if (!cacheItem) return null;
        
        const parsedItem = JSON.parse(cacheItem);
        
        // Check if cache is expired
        if (parsedItem.expiration < Date.now()) {
            localStorage.removeItem(key);
            return null;
        }
        
        return parsedItem.data;
    } catch (e) {
        console.warn('Error retrieving cached data:', e);
        return null;
    }
};

/**
 * Clean up old cache entries
 */
const cleanupCache = () => {
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            // Only clean up our cache keys
            if (key.startsWith('book_') || key.startsWith('featured_')) {
                const cacheItem = JSON.parse(localStorage.getItem(key));
                
                // Remove if expired
                if (cacheItem.expiration < Date.now()) {
                    localStorage.removeItem(key);
                }
            }
        }
    } catch (e) {
        console.warn('Error cleaning up cache:', e);
    }
};

// Clean up expired cache entries on module load
cleanupCache();
