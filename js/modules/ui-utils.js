/**
 * UI Utilities Module
 * Contains helper functions for UI manipulation
 */

/**
 * Hide all main content sections
 */
export const hideAllSections = () => {
    const sections = [
        document.getElementById('hero-section'),
        document.getElementById('search-results-section'),
        document.getElementById('book-details-section'),
        document.getElementById('book-reviews-section'),
        document.getElementById('category-section'),
        document.getElementById('featured-books-section'),
        document.getElementById('chat-section')
    ];
    
    // Also hide reading list section if exists
    const readingListSection = document.getElementById('reading-list-section');
    if (readingListSection) {
        sections.push(readingListSection);
    }
    
    sections.forEach(section => {
        if (section) {
            section.style.display = 'none';
        }
    });
};

/**
 * Show hero section and hide others
 */
export const showHeroSection = () => {
    hideAllSections();
    document.getElementById('hero-section').style.display = 'block';
    document.getElementById('category-section').style.display = 'block';
    document.getElementById('featured-books-section').style.display = 'block';
};

/**
 * Show search results section and hide others
 */
export const showSearchResults = () => {
    hideAllSections();
    document.getElementById('search-results-section').style.display = 'block';
};

/**
 * Show book details and hide book details
 */
export const hideBookDetails = () => {
    document.getElementById('book-details-section').style.display = 'none';
    document.getElementById('book-reviews-section').style.display = 'none';
};

/**
 * Toggle chat section visibility
 */
export const toggleChatSection = () => {
    const chatSection = document.getElementById('chat-section');
    if (chatSection.style.display === 'none' || chatSection.style.display === '') {
        hideAllSections();
        chatSection.style.display = 'block';
    } else {
        showHeroSection();
    }
};

/**
 * Create a book card element
 * @param {Object} bookData - Formatted book data
 * @param {Function} onClickHandler - Function to call when card is clicked
 * @returns {HTMLElement} - Book card element
 */
export const createBookCard = (bookData, onClickHandler) => {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-3 col-sm-6 mb-4';
    
    colDiv.innerHTML = `
        <div class="card book-card h-100" data-book-id="${bookData.id}">
            <img src="${bookData.coverUrl}" class="card-img-top" alt="${bookData.title}" loading="lazy">
            <div class="card-body">
                <h5 class="card-title">${bookData.title}</h5>
                <p class="card-text text-muted">${bookData.authors}</p>
                <div class="star-rating">
                    ${getStarRatingHTML(bookData.averageRating)}
                </div>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary btn-sm view-details" data-book-id="${bookData.id}">Detaylar</button>
            </div>
        </div>
    `;
    
    // Add click event to the card
    const viewDetailsBtn = colDiv.querySelector('.view-details');
    viewDetailsBtn.addEventListener('click', () => {
        onClickHandler(bookData.id);
    });
    
    return colDiv;
};

/**
 * Generate HTML for star rating
 * @param {number} rating - Rating value (0-5)
 * @returns {string} - HTML for star rating
 */
export const getStarRatingHTML = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let html = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        html += '<i class="fas fa-star"></i>';
    }
    
    // Half star
    if (halfStar) {
        html += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        html += '<i class="far fa-star"></i>';
    }
    
    return html;
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

/**
 * Create a loading spinner element
 * @returns {HTMLElement} - Loading spinner element
 */
export const createLoadingSpinner = () => {
    const spinnerContainer = document.createElement('div');
    spinnerContainer.className = 'spinner-container text-center py-5';
    spinnerContainer.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Yükleniyor...</span>
        </div>
        <p class="mt-2">Yükleniyor...</p>
    `;
    return spinnerContainer;
};

/**
 * Create an error message element
 * @param {string} message - Error message to display
 * @returns {HTMLElement} - Error message element
 */
export const createErrorMessage = (message) => {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'alert alert-danger';
    errorContainer.role = 'alert';
    errorContainer.innerHTML = `
        <i class="fas fa-exclamation-circle me-2"></i>
        <span>${message}</span>
    `;
    return errorContainer;
};

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds
 */
export const showToast = (message, type = 'info', duration = 3000) => {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '5';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast show bg-${type}`;
    toast.role = 'alert';
    toast.ariaLive = 'assertive';
    toast.ariaAtomic = 'true';
    
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">Kitapsever</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Kapat"></button>
        </div>
        <div class="toast-body text-white">
            ${message}
        </div>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Auto-remove after duration
    setTimeout(() => {
        toast.remove();
    }, duration);
    
    // Add click event to close button
    const closeButton = toast.querySelector('.btn-close');
    closeButton.addEventListener('click', () => {
        toast.remove();
    });
};

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
