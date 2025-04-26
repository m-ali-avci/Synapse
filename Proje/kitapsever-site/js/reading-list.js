/**
 * Reading List functionality for Kitapsever Website
 * Manages user's reading lists using localStorage
 */

// Reading list types
const ReadingListType = {
    WANT_TO_READ: 'want-to-read',
    CURRENTLY_READING: 'currently-reading',
    READ: 'read'
};

// Reading list names in Turkish
const ReadingListNames = {
    [ReadingListType.WANT_TO_READ]: 'Okumak İstiyorum',
    [ReadingListType.CURRENTLY_READING]: 'Şu Anda Okuyorum',
    [ReadingListType.READ]: 'Okudum'
};

// Reading list storage keys
const STORAGE_KEY_PREFIX = 'kitapsever_reading_list_';

/**
 * Initialize reading list functionality
 */
function initializeReadingList() {
    // Add event listener for reading list link
    const readingListLink = document.getElementById('reading-list-link');
    if (readingListLink) {
        readingListLink.addEventListener('click', (e) => {
            e.preventDefault();
            showReadingListSection();
        });
    }
}

/**
 * Add book to reading list
 * @param {string} listType - Type of reading list
 * @param {Object} bookData - Book data to add
 */
function addToReadingList(listType, bookData) {
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
    
    // Update UI
    updateReadingListUI();
}

/**
 * Remove book from reading list
 * @param {string} listType - Type of reading list
 * @param {string} bookId - ID of book to remove
 */
function removeFromReadingList(listType, bookId) {
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
    
    // Update UI
    updateReadingListUI();
}

/**
 * Remove book from all reading lists
 * @param {string} bookId - ID of book to remove
 */
function removeFromAllReadingLists(bookId) {
    Object.values(ReadingListType).forEach(listType => {
        const list = getReadingList(listType);
        const updatedList = list.filter(book => book.id !== bookId);
        saveReadingList(listType, updatedList);
    });
}

/**
 * Get reading list
 * @param {string} listType - Type of reading list
 * @returns {Array} - Array of books in the list
 */
function getReadingList(listType) {
    const storageKey = STORAGE_KEY_PREFIX + listType;
    const storedList = localStorage.getItem(storageKey);
    return storedList ? JSON.parse(storedList) : [];
}

/**
 * Save reading list
 * @param {string} listType - Type of reading list
 * @param {Array} list - Array of books to save
 */
function saveReadingList(listType, list) {
    const storageKey = STORAGE_KEY_PREFIX + listType;
    localStorage.setItem(storageKey, JSON.stringify(list));
}

/**
 * Check if book is in reading list
 * @param {string} listType - Type of reading list
 * @param {string} bookId - ID of book to check
 * @returns {boolean} - True if book is in list
 */
function isInReadingList(listType, bookId) {
    const list = getReadingList(listType);
    return list.some(book => book.id === bookId);
}

/**
 * Get reading list type for book
 * @param {string} bookId - ID of book to check
 * @returns {string|null} - Reading list type or null if not in any list
 */
function getReadingListTypeForBook(bookId) {
    for (const listType of Object.values(ReadingListType)) {
        if (isInReadingList(listType, bookId)) {
            return listType;
        }
    }
    return null;
}

/**
 * Show reading list section
 */
function showReadingListSection() {
    // Hide other sections
    hideAllSections();
    
    // Create reading list section if it doesn't exist
    let readingListSection = document.getElementById('reading-list-section');
    if (!readingListSection) {
        readingListSection = createReadingListSection();
    }
    
    // Show reading list section
    readingListSection.style.display = 'block';
    
    // Update reading list UI
    updateReadingListUI();
}

/**
 * Create reading list section
 * @returns {HTMLElement} - Reading list section element
 */
function createReadingListSection() {
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
    
    // Append to body instead of container to avoid nesting issues
    document.body.appendChild(section);
    
    return section;
}

/**
 * Update reading list UI
 */
function updateReadingListUI() {
    // Update book details UI if book details are shown
    if (currentBookId && document.getElementById('book-details-section').style.display !== 'none') {
        updateBookDetailsReadingListUI(currentBookId);
    }
    
    // Update reading list section if visible
    const readingListSection = document.getElementById('reading-list-section');
    if (readingListSection && readingListSection.style.display !== 'none') {
        // Update each list
        Object.values(ReadingListType).forEach(listType => {
            updateReadingListTab(listType);
        });
    }
}

/**
 * Update reading list tab
 * @param {string} listType - Type of reading list
 */
function updateReadingListTab(listType) {
    const listContainer = document.getElementById(`${listType}-list`);
    if (!listContainer) return;
    
    // Clear container
    listContainer.innerHTML = '';
    
    // Get books in list
    const books = getReadingList(listType);
    
    if (books.length === 0) {
        listContainer.innerHTML = `<div class="col-12 text-center my-5"><p>Bu listede henüz kitap yok.</p></div>`;
        return;
    }
    
    // Add books to container
    books.forEach(book => {
        const bookElement = createReadingListBookCard(book, listType);
        listContainer.appendChild(bookElement);
    });
}

/**
 * Create reading list book card
 * @param {Object} book - Book data
 * @param {string} listType - Type of reading list
 * @returns {HTMLElement} - Book card element
 */
function createReadingListBookCard(book, listType) {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-3 col-sm-6 mb-4';
    
    colDiv.innerHTML = `
        <div class="card book-card h-100">
            <img src="${book.coverUrl}" class="card-img-top" alt="${book.title}" style="height: 250px; object-fit: cover;">
            <div class="card-body">
                <h5 class="card-title">${book.title}</h5>
                <p class="card-text text-muted">${book.authors}</p>
                <div class="star-rating">
                    ${getStarRatingHTML(book.averageRating)}
                </div>
            </div>
            <div class="card-footer d-flex justify-content-between">
                <button class="btn btn-primary btn-sm view-details" data-book-id="${book.id}">Detaylar</button>
                <button class="btn btn-danger btn-sm remove-from-list" data-book-id="${book.id}" data-list-type="${listType}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    // Add click event to the view details button
    const viewDetailsBtn = colDiv.querySelector('.view-details');
    viewDetailsBtn.addEventListener('click', () => {
        showBookDetails(book.id);
    });
    
    // Add click event to the remove button
    const removeBtn = colDiv.querySelector('.remove-from-list');
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeFromReadingList(listType, book.id);
    });
    
    return colDiv;
}

/**
 * Update book details reading list UI
 * @param {string} bookId - ID of book
 */
function updateBookDetailsReadingListUI(bookId) {
    // Remove existing reading list buttons
    const existingContainer = document.getElementById('reading-list-buttons');
    if (existingContainer) {
        existingContainer.remove();
    }
    
    // Get book data
    const bookData = getCurrentBookData();
    if (!bookData) return;
    
    // Create reading list buttons container
    const container = document.createElement('div');
    container.id = 'reading-list-buttons';
    container.className = 'mt-3';
    
    // Add heading
    const heading = document.createElement('h4');
    heading.textContent = 'Okuma Listesi';
    container.appendChild(heading);
    
    // Create button group
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'btn-group w-100';
    
    // Get current list type for book
    const currentListType = getReadingListTypeForBook(bookId);
    
    // Add buttons for each list type
    Object.values(ReadingListType).forEach(listType => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `btn ${currentListType === listType ? 'btn-success' : 'btn-outline-secondary'}`;
        button.textContent = ReadingListNames[listType];
        button.dataset.listType = listType;
        
        // Add click event
        button.addEventListener('click', () => {
            if (currentListType === listType) {
                // Remove from list if already in this list
                removeFromReadingList(listType, bookId);
            } else {
                // Add to list
                addToReadingList(listType, bookData);
            }
        });
        
        buttonGroup.appendChild(button);
    });
    
    container.appendChild(buttonGroup);
    
    // Add to book info container
    const bookInfoContainer = document.getElementById('book-info-container');
    if (bookInfoContainer) {
        bookInfoContainer.appendChild(container);
    }
}

/**
 * Get current book data
 * @returns {Object|null} - Current book data or null if not available
 */
function getCurrentBookData() {
    if (!currentBookId) return null;
    
    // Try to find in search results
    const book = searchResults.find(book => book.id === currentBookId);
    if (book) {
        return window.bookApi.formatBookData(book);
    }
    
    // Try to find in reading lists
    for (const listType of Object.values(ReadingListType)) {
        const list = getReadingList(listType);
        const book = list.find(book => book.id === currentBookId);
        if (book) {
            return book;
        }
    }
    
    return null;
}

// Initialize reading list when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeReadingList();
});
