/**
 * Main JavaScript for Kitapsever Website
 * Handles user interactions and UI updates
 */

// Import modules
import * as api from './modules/api.js';
import * as readingList from './modules/reading-list.js';
import * as reviews from './modules/reviews.js';
import * as chat from './modules/chat.js';
import * as uiUtils from './modules/ui-utils.js';

// Global variables
let currentSearchQuery = '';
let currentStartIndex = 0;
let currentCategory = '';
let currentBookId = '';
let searchResults = [];

// DOM Elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const heroSearchInput = document.getElementById('hero-search-input');
const heroSearchButton = document.getElementById('hero-search-button');
const searchResultsSection = document.getElementById('search-results-section');
const searchResultsContainer = document.getElementById('search-results');
const loadMoreContainer = document.getElementById('load-more-container');
const loadMoreButton = document.getElementById('load-more-button');
const bookDetailsSection = document.getElementById('book-details-section');
const bookReviewsSection = document.getElementById('book-reviews-section');
const backToResultsButton = document.getElementById('back-to-results');
const bookCoverContainer = document.getElementById('book-cover-container');
const bookInfoContainer = document.getElementById('book-info-container');
const reviewsContainer = document.getElementById('reviews-container');
const reviewForm = document.getElementById('review-form');
const categorySection = document.getElementById('category-section');
const categoryCards = document.querySelectorAll('.category-card');
const featuredBooksContainer = document.getElementById('featured-books');
const chatLink = document.getElementById('chat-link');
const chatSection = document.getElementById('chat-section');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const heroSection = document.getElementById('hero-section');
const categoriesDropdown = document.getElementById('categories-dropdown');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Load featured books on page load
    loadFeaturedBooks();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize chat messages from localStorage
    initializeChat();
});

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Ana Sayfa link click
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.textContent.trim() === 'Ana Sayfa') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                uiUtils.showHeroSection();
            });
        }
    });
    
    // Navbar brand (Kitapsever) click
    document.querySelector('.navbar-brand').addEventListener('click', (e) => {
        e.preventDefault();
        uiUtils.showHeroSection();
    });
    
    // Search form submission
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            currentSearchQuery = query;
            currentStartIndex = 0;
            currentCategory = '';
            searchBooks(query);
        }
    });
    
    // Hero search button click - using debounce to prevent multiple rapid clicks
    heroSearchButton.addEventListener('click', uiUtils.debounce(() => {
        const query = heroSearchInput.value.trim();
        if (query) {
            currentSearchQuery = query;
            currentStartIndex = 0;
            currentCategory = '';
            searchBooks(query);
            searchInput.value = query; // Update the navbar search input
        }
    }, 300));
    
    // Load more results button
    loadMoreButton.addEventListener('click', uiUtils.debounce(() => {
        if (currentCategory) {
            loadMoreCategoryBooks();
        } else {
            loadMoreSearchResults();
        }
    }, 300));
    
    // Back to results button
    backToResultsButton.addEventListener('click', () => {
        uiUtils.hideBookDetails();
        if (currentCategory) {
            showCategoryBooks(currentCategory);
        } else if (searchResults.length > 0) {
            uiUtils.showSearchResults();
        } else {
            uiUtils.showHeroSection();
        }
    });
    
    // Category cards click
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.getAttribute('data-category');
            currentCategory = category;
            currentStartIndex = 0;
            showCategoryBooks(category);
        });
    });
    
    // Categories dropdown items click
    const dropdownItems = categoriesDropdown.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const category = item.getAttribute('data-category');
            currentCategory = category;
            currentStartIndex = 0;
            showCategoryBooks(category);
        });
    });
    
    // Review form submission
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addReview();
    });
    
    // Chat link click
    chatLink.addEventListener('click', (e) => {
        e.preventDefault();
        uiUtils.toggleChatSection();
    });
    
    // Chat form submission
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendChatMessage();
    });
}

/**
 * Search books using the API
 * @param {string} query - Search query
 */
function searchBooks(query) {
    // Show loading state
    searchResultsContainer.innerHTML = '';
    searchResultsContainer.appendChild(uiUtils.createLoadingSpinner());
    uiUtils.showSearchResults();
    
    // Call the API
    api.searchBooks(query, currentStartIndex)
        .then(data => {
            // Store results
            searchResults = data.items || [];
            
            // Display results
            displaySearchResults(searchResults);
            
            // Show/hide load more button
            updateLoadMoreButton(data.totalItems);
        })
        .catch(error => {
            searchResultsContainer.innerHTML = '';
            searchResultsContainer.appendChild(
                uiUtils.createErrorMessage(`Arama sırasında bir hata oluştu: ${error.message}`)
            );
        });
}

/**
 * Display search results in the UI
 * @param {Array} books - Array of book objects
 */
function displaySearchResults(books) {
    // Clear previous results if this is a new search
    if (currentStartIndex === 0) {
        searchResultsContainer.innerHTML = '';
    }
    
    if (!books || books.length === 0) {
        searchResultsContainer.innerHTML = '<div class="no-results"><i class="fas fa-book-open"></i><h3>Sonuç bulunamadı</h3><p>Lütfen farklı anahtar kelimelerle tekrar arayın.</p></div>';
        return;
    }
    
    // Create HTML for each book
    books.forEach(book => {
        const bookData = api.formatBookData(book);
        const bookElement = uiUtils.createBookCard(bookData, showBookDetails);
        searchResultsContainer.appendChild(bookElement);
    });
}

/**
 * Load more search results
 */
function loadMoreSearchResults() {
    currentStartIndex += 10;
    
    // Show loading state
    loadMoreButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Yükleniyor...';
    loadMoreButton.disabled = true;
    
    // Call the API
    api.searchBooks(currentSearchQuery, currentStartIndex)
        .then(data => {
            // Add new results to existing results
            const newResults = data.items || [];
            searchResults = [...searchResults, ...newResults];
            
            // Display new results
            displaySearchResults(newResults);
            
            // Update load more button
            updateLoadMoreButton(data.totalItems);
        })
        .catch(error => {
            console.error('Error loading more results:', error);
            loadMoreButton.innerHTML = 'Daha Fazla Göster';
            loadMoreButton.disabled = false;
            uiUtils.showToast(`Daha fazla sonuç yüklenirken hata oluştu: ${error.message}`, 'danger');
        });
}

/**
 * Update the load more button based on total results
 * @param {number} totalItems - Total number of items
 */
function updateLoadMoreButton(totalItems) {
    loadMoreButton.innerHTML = 'Daha Fazla Göster';
    loadMoreButton.disabled = false;
    
    if (totalItems > currentStartIndex + 10) {
        loadMoreContainer.style.display = 'block';
    } else {
        loadMoreContainer.style.display = 'none';
    }
}

/**
 * Show book details
 * @param {string} bookId - Book ID
 */
function showBookDetails(bookId) {
    currentBookId = bookId;
    
    // Show loading state
    bookCoverContainer.innerHTML = '';
    bookCoverContainer.appendChild(uiUtils.createLoadingSpinner());
    bookInfoContainer.innerHTML = '';
    
    // Hide other sections and show book details section
    uiUtils.hideAllSections();
    bookDetailsSection.style.display = 'block';
    bookReviewsSection.style.display = 'block';
    
    // Call the API
    api.getBookDetails(bookId)
        .then(book => {
            displayBookDetails(book);
            displayBookReviews(bookId);
            // Update reading list UI for this book
            updateBookDetailsReadingListUI(bookId);
        })
        .catch(error => {
            console.error('Error fetching book details:', error);
            bookInfoContainer.innerHTML = '';
            bookInfoContainer.appendChild(
                uiUtils.createErrorMessage(`Kitap detayları yüklenirken bir hata oluştu: ${error.message}`)
            );
        });
}

/**
 * Display book details in the UI
 * @param {Object} book - Book object from API
 */
function displayBookDetails(book) {
    const bookData = api.formatBookData(book);
    
    // Display book cover
    bookCoverContainer.innerHTML = `
        <img src="${bookData.largeCoverUrl}" alt="${bookData.title}" class="img-fluid">
        <div class="mt-3">
            <a href="${bookData.previewLink}" target="_blank" class="btn btn-outline-primary btn-sm w-100">
                <i class="fas fa-book-open me-2"></i>Önizleme
            </a>
        </div>
    `;
    
    // Display book info
    bookInfoContainer.innerHTML = `
        <div class="book-info">
            <h1>${bookData.title}</h1>
            <p class="author">Yazar: ${bookData.authors}</p>
            <div class="rating mb-3">
                ${uiUtils.getStarRatingHTML(bookData.averageRating)}
                <span class="ms-2">${bookData.averageRating ? bookData.averageRating.toFixed(1) : '0'}/5 (${bookData.ratingsCount} değerlendirme)</span>
            </div>
            <div class="description">
                <h4>Açıklama</h4>
                <p>${bookData.description}</p>
            </div>
            <div class="details">
                <h4>Detaylar</h4>
                <p><strong>Yayın Tarihi:</strong> ${bookData.publishedDate}</p>
                <p><strong>Yayıncı:</strong> ${bookData.publisher}</p>
                <p><strong>Sayfa Sayısı:</strong> ${bookData.pageCount}</p>
                <p><strong>Kategoriler:</strong> ${bookData.categories}</p>
                <p><strong>Dil:</strong> ${bookData.language === 'en' ? 'İngilizce' : bookData.language === 'tr' ? 'Türkçe' : bookData.language}</p>
            </div>
        </div>
    `;
}

/**
 * Display book reviews in the UI
 * @param {string} bookId - Book ID
 */
function displayBookReviews(bookId) {
    // Get reviews from local storage
    const bookReviews = reviews.getReviews(bookId);
    
    // Clear previous reviews
    reviewsContainer.innerHTML = '';
    
    if (bookReviews.length === 0) {
        reviewsContainer.innerHTML = '<div class="alert alert-info">Bu kitap için henüz yorum yapılmamış. İlk yorumu siz yapın!</div>';
        return;
    }
    
    // Create HTML for each review
    bookReviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'card review-card';
        
        reviewElement.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h5 class="card-title reviewer mb-0">${review.name}</h5>
                    <span class="date">${reviews.formatDate(review.date)}</span>
                </div>
                <div class="rating mb-2">
                    ${uiUtils.getStarRatingHTML(review.rating)}
                </div>
                <p class="card-text">${review.text}</p>
            </div>
        `;
        
        reviewsContainer.appendChild(reviewElement);
    });
}

/**
 * Add a new review
 */
function addReview() {
    const name = document.getElementById('reviewer-name').value.trim();
    const rating = parseInt(document.getElementById('review-rating').value);
    const text = document.getElementById('review-text').value.trim();
    
    if (!name || !rating || !text) {
        uiUtils.showToast('Lütfen tüm alanları doldurun.', 'warning');
        return;
    }
    
    // Create review object
    const review = {
        name,
        rating,
        text,
        date: new Date().toISOString()
    };
    
    // Add review to local storage
    reviews.addReviewToStorage(currentBookId, review);
    
    // Display updated reviews
    displayBookReviews(currentBookId);
    
    // Reset form
    reviewForm.reset();
    
    // Show success message
    uiUtils.showToast('Yorumunuz başarıyla eklendi.', 'success');
}

/**
 * Show category books
 * @param {string} category - Category to show
 */
function showCategoryBooks(category) {
    // Show loading state
    searchResultsContainer.innerHTML = '';
    searchResultsContainer.appendChild(uiUtils.createLoadingSpinner());
    
    // Update UI
    document.getElementById('search-results-section').querySelector('h2').textContent = getCategoryTitle(category);
    uiUtils.showSearchResults();
    
    // Call the API
    api.searchBooksByCategory(category, currentStartIndex)
        .then(data => {
            // Store results
            searchResults = data.items || [];
            
            // Display results
            displaySearchResults(searchResults);
            
            // Show/hide load more button
            updateLoadMoreButton(data.totalItems);
        })
        .catch(error => {
            searchResultsContainer.innerHTML = '';
            searchResultsContainer.appendChild(
                uiUtils.createErrorMessage(`Kategori kitapları yüklenirken bir hata oluştu: ${error.message}`)
            );
        });
}

/**
 * Load more category books
 */
function loadMoreCategoryBooks() {
    currentStartIndex += 10;
    
    // Show loading state
    loadMoreButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Yükleniyor...';
    loadMoreButton.disabled = true;
    
    // Call the API
    api.searchBooksByCategory(currentCategory, currentStartIndex)
        .then(data => {
            // Add new results to existing results
            const newResults = data.items || [];
            searchResults = [...searchResults, ...newResults];
            
            // Display new results
            displaySearchResults(newResults);
            
            // Update load more button
            updateLoadMoreButton(data.totalItems);
        })
        .catch(error => {
            console.error('Error loading more category books:', error);
            loadMoreButton.innerHTML = 'Daha Fazla Göster';
            loadMoreButton.disabled = false;
            uiUtils.showToast(`Daha fazla kitap yüklenirken hata oluştu: ${error.message}`, 'danger');
        });
}

/**
 * Get category title in Turkish
 * @param {string} category - Category name
 * @returns {string} - Category title in Turkish
 */
function getCategoryTitle(category) {
    const categoryTitles = {
        'fiction': 'Kurgu Kitapları',
        'nonfiction': 'Kurgu Dışı Kitaplar',
        'science': 'Bilim Kitapları',
        'history': 'Tarih Kitapları',
        'biography': 'Biyografi Kitapları',
        'fantasy': 'Fantastik Kitaplar',
        'mystery': 'Gizem Kitapları',
        'romance': 'Romantik Kitaplar'
    };
    
    return categoryTitles[category] || 'Kitaplar';
}

/**
 * Load featured books
 */
function loadFeaturedBooks() {
    // Show loading state
    featuredBooksContainer.innerHTML = '';
    featuredBooksContainer.appendChild(uiUtils.createLoadingSpinner());
    
    // Call the API
    api.getFeaturedBooks()
        .then(data => {
            // Display featured books
            displayFeaturedBooks(data.items || []);
        })
        .catch(error => {
            console.error('Error fetching featured books:', error);
            featuredBooksContainer.innerHTML = '';
            featuredBooksContainer.appendChild(
                uiUtils.createErrorMessage(`Öne çıkan kitaplar yüklenirken bir hata oluştu: ${error.message}`)
            );
        });
}

/**
 * Display featured books in the UI
 * @param {Array} books - Array of book objects
 */
function displayFeaturedBooks(books) {
    // Clear container
    featuredBooksContainer.innerHTML = '';
    
    if (!books || books.length === 0) {
        featuredBooksContainer.innerHTML = '<div class="col-12 text-center"><p>Öne çıkan kitaplar yüklenirken bir hata oluştu.</p></div>';
        return;
    }
    
    // Create HTML for each book
    books.forEach(book => {
        const bookData = api.formatBookData(book);
        const bookElement = uiUtils.createBookCard(bookData, showBookDetails);
        featuredBooksContainer.appendChild(bookElement);
    });
}

/**
 * Initialize chat
 */
function initializeChat() {
    // Get chat messages from localStorage
    const messages = chat.initializeChat();
    
    // Display messages
    displayChatMessages(messages);
    
    // Add welcome message if no messages
    if (messages.length === 0) {
        const welcomeMessage = chat.createSystemMessage('Kitapsever sohbete hoş geldiniz! Kitaplar hakkında konuşmak için mesaj yazabilirsiniz.');
        const updatedMessages = chat.saveChatMessage(welcomeMessage);
        displayChatMessages(updatedMessages);
    }
}

/**
 * Display chat messages in the UI
 * @param {Array} messages - Array of message objects
 */
function displayChatMessages(messages) {
    // Clear chat container
    chatMessages.innerHTML = '';
    
    // Create HTML for each message
    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${message.sender === 'user' ? 'user-message' : 'system-message'}`;
        
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-sender">${message.sender === 'user' ? 'Siz' : 'Kitapsever'}</span>
                <span class="message-time">${chat.formatMessageTime(message.time)}</span>
            </div>
            <div class="message-body">
                ${message.text}
            </div>
        `;
        
        chatMessages.appendChild(messageElement);
    });
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Send chat message
 */
function sendChatMessage() {
    const text = chatInput.value.trim();
    
    if (!text) return;
    
    // Create user message
    const userMessage = chat.createUserMessage(text);
    
    // Save and display messages
    let messages = chat.saveChatMessage(userMessage);
    displayChatMessages(messages);
    
    // Clear input
    chatInput.value = '';
    
    // Create system response (simple echo for now)
    setTimeout(() => {
        const responseText = getAutomaticResponse(text);
        const systemMessage = chat.createSystemMessage(responseText);
        messages = chat.saveChatMessage(systemMessage);
        displayChatMessages(messages);
    }, 1000);
}

/**
 * Get automatic response based on user input
 * @param {string} userText - User input text
 * @returns {string} - Automatic response
 */
function getAutomaticResponse(userText) {
    const lowerText = userText.toLowerCase();
    
    if (lowerText.includes('merhaba') || lowerText.includes('selam')) {
        return 'Merhaba! Size nasıl yardımcı olabilirim?';
    } else if (lowerText.includes('öneri') || lowerText.includes('tavsiye')) {
        return 'Size kitap önerebilmem için hangi tür kitapları sevdiğinizi söyleyebilir misiniz?';
    } else if (lowerText.includes('teşekkür')) {
        return 'Rica ederim! Başka bir konuda yardıma ihtiyacınız olursa buradayım.';
    } else if (lowerText.includes('yazar')) {
        return 'Hangi yazar hakkında konuşmak istersiniz?';
    } else if (lowerText.includes('kitap')) {
        return 'Kitaplar hakkında konuşmayı çok severim! Hangi kitaptan bahsediyorsunuz?';
    } else {
        return 'İlginç bir konu! Daha fazla detay paylaşabilir misiniz?';
    }
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
    const currentListType = readingList.getReadingListTypeForBook(bookId);
    
    // Add buttons for each list type
    Object.values(readingList.ReadingListType).forEach(listType => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `btn ${currentListType === listType ? 'btn-success' : 'btn-outline-secondary'}`;
        button.textContent = readingList.ReadingListNames[listType];
        button.dataset.listType = listType;
        
        // Add click event
        button.addEventListener('click', () => {
            if (currentListType === listType) {
                // Remove from list if already in this list
                readingList.removeFromReadingList(listType, bookId);
                uiUtils.showToast('Kitap okuma listenizden çıkarıldı.', 'info');
            } else {
                // Add to list
                readingList.addToReadingList(listType, bookData);
                uiUtils.showToast(`Kitap "${readingList.ReadingListNames[listType]}" listenize eklendi.`, 'success');
            }
            
            // Update UI
            updateBookDetailsReadingListUI(bookId);
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
        return api.formatBookData(book);
    }
    
    // Try to find in reading lists
    for (const listType of Object.values(readingList.ReadingListType)) {
        const list = readingList.getReadingList(listType);
        const book = list.find(book => book.id === currentBookId);
        if (book) {
            return book;
        }
    }
    
    return null;
}

/**
 * Show reading list section
 */
function showReadingListSection() {
    // Hide other sections
    uiUtils.hideAllSections();
    
    // Create reading list section if it doesn't exist
    let readingListSection = document.getElementById('reading-list-section');
    if (!readingListSection) {
        readingListSection = readingList.createReadingListSection();
        document.body.appendChild(readingListSection);
    }
    
    // Show reading list section
    readingListSection.style.display = 'block';
    
    // Update reading list UI
    updateReadingListUI();
}

/**
 * Update reading list UI
 */
function updateReadingListUI() {
    // Update each list
    Object.values(readingList.ReadingListType).forEach(listType => {
        updateReadingListTab(listType);
    });
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
    const books = readingList.getReadingList(listType);
    
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
            <img src="${book.coverUrl}" class="card-img-top" alt="${book.title}" style="height: 250px; object-fit: cover;" loading="lazy">
            <div class="card-body">
                <h5 class="card-title">${book.title}</h5>
                <p class="card-text text-muted">${book.authors}</p>
                <div class="star-rating">
                    ${uiUtils.getStarRatingHTML(book.averageRating)}
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
        readingList.removeFromReadingList(listType, book.id);
        updateReadingListUI();
        uiUtils.showToast('Kitap okuma listenizden çıkarıldı.', 'info');
    });
    
    return colDiv;
}

// Add reading list link event listener
document.addEventListener('DOMContentLoaded', () => {
    const readingListLink = document.getElementById('reading-list-link');
    if (readingListLink) {
        readingListLink.addEventListener('click', (e) => {
            e.preventDefault();
            showReadingListSection();
        });
    }
});
