/**
 * Reading List functionality module
 * Manages user's reading lists using localStorage
 */

// Reading list types
export const ReadingListType = {
    WANT_TO_READ: 'want-to-read',
    CURRENTLY_READING: 'currently-reading',
    READ: 'read'
};

// Reading list names in Turkish
export const ReadingListNames = {
    [ReadingListType.WANT_TO_READ]: 'Okumak İstiyorum',
    [ReadingListType.CURRENTLY_READING]: 'Şu Anda Okuyorum',
    [ReadingListType.READ]: 'Okudum'
};

// Reading list storage keys
const STORAGE_KEY_PREFIX = 'kitapsever_reading_list_';

/**
 * Add book to reading list
 * @param {string} listType - Type of reading list
 * @param {Object} bookData - Book data to add
 */
export const addToReadingList = (listType, bookData) => {
    if (!Object.values(ReadingListType).includes(listType)) {
        console.error('Invalid reading list type:', listType);
        return;
    }
    
    // Get current list
    const list = getReadingList(listType);
    
    // Check if book already exists in this list
    const existingIndex = list.findIndex(book => book.id === bookData.id);
    if (existingIndex >= 0) {
        // Book already in this list, no need to add again
        return;
    }
    
    // Remove from other lists if present
    removeFromAllReadingLists(bookData.id);
    
    // Add to specified list
    list.push(bookData);
    
    // Save updated list
    saveReadingList(listType, list);
};

/**
 * Remove book from reading list
 * @param {string} listType - Type of reading list
 * @param {string} bookId - ID of book to remove
 */
export const removeFromReadingList = (listType, bookId) => {
    if (!Object.values(ReadingListType).includes(listType)) {
        console.error('Invalid reading list type:', listType);
        return;
    }
    
    // Get current list
    const list = getReadingList(listType);
    
    // Remove book if exists
    const updatedList = list.filter(book => book.id !== bookId);
    
    // Save updated list
    saveReadingList(listType, updatedList);
};

/**
 * Remove book from all reading lists
 * @param {string} bookId - ID of book to remove
 */
export const removeFromAllReadingLists = (bookId) => {
    Object.values(ReadingListType).forEach(listType => {
        const list = getReadingList(listType);
        const updatedList = list.filter(book => book.id !== bookId);
        saveReadingList(listType, updatedList);
    });
};

/**
 * Get reading list
 * @param {string} listType - Type of reading list
 * @returns {Array} - Array of books in the list
 */
export const getReadingList = (listType) => {
    const storageKey = STORAGE_KEY_PREFIX + listType;
    const storedList = localStorage.getItem(storageKey);
    return storedList ? JSON.parse(storedList) : [];
};

/**
 * Save reading list
 * @param {string} listType - Type of reading list
 * @param {Array} list - Array of books to save
 */
export const saveReadingList = (listType, list) => {
    const storageKey = STORAGE_KEY_PREFIX + listType;
    localStorage.setItem(storageKey, JSON.stringify(list));
};

/**
 * Check if book is in reading list
 * @param {string} listType - Type of reading list
 * @param {string} bookId - ID of book to check
 * @returns {boolean} - True if book is in list
 */
export const isInReadingList = (listType, bookId) => {
    const list = getReadingList(listType);
    return list.some(book => book.id === bookId);
};

/**
 * Get reading list type for book
 * @param {string} bookId - ID of book to check
 * @returns {string|null} - Reading list type or null if not in any list
 */
export const getReadingListTypeForBook = (bookId) => {
    for (const listType of Object.values(ReadingListType)) {
        if (isInReadingList(listType, bookId)) {
            return listType;
        }
    }
    return null;
};

/**
 * Create reading list section
 * @returns {HTMLElement} - Reading list section element
 */
export const createReadingListSection = () => {
    const section = document.createElement('div');
    section.id = 'reading-list-section';
    section.className = 'container mt-4';
    
    section.innerHTML = `
        <div class="row">
            <div class="col-md-12">
                <h2 class="mb-4">Okuma Listem</h2>
                <ul class="nav nav-tabs" id="reading-list-tabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="want-to-read-tab" data-bs-toggle="tab" data-bs-target="#want-to-read" type="button" role="tab" aria-controls="want-to-read" aria-selected="true">Okumak İstiyorum</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="currently-reading-tab" data-bs-toggle="tab" data-bs-target="#currently-reading" type="button" role="tab" aria-controls="currently-reading" aria-selected="false">Şu Anda Okuyorum</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="read-tab" data-bs-toggle="tab" data-bs-target="#read" type="button" role="tab" aria-controls="read" aria-selected="false">Okudum</button>
                    </li>
                </ul>
                <div class="tab-content" id="reading-list-tab-content">
                    <div class="tab-pane fade show active" id="want-to-read" role="tabpanel" aria-labelledby="want-to-read-tab">
                        <div class="row mt-4" id="want-to-read-list"></div>
                    </div>
                    <div class="tab-pane fade" id="currently-reading" role="tabpanel" aria-labelledby="currently-reading-tab">
                        <div class="row mt-4" id="currently-reading-list"></div>
                    </div>
                    <div class="tab-pane fade" id="read" role="tabpanel" aria-labelledby="read-tab">
                        <div class="row mt-4" id="read-list"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return section;
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
