/**
 * Main JavaScript for Kitapsever Website
 * Handles user interactions and UI updates
 */

// Global variables
let currentSearchQuery = '';
let currentStartIndex = 0;
let currentCategory = '';
let currentBookId = '';
let searchResults = [];
let reviewsData = {}; // Store reviews locally since Google Books API doesn't support user reviews

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
                showHeroSection();
            });
        }
    });
    
    // Navbar brand (Kitapsever) click
    document.querySelector('.navbar-brand').addEventListener('click', (e) => {
        e.preventDefault();
        showHeroSection();
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
    
    // Hero search button click
    heroSearchButton.addEventListener('click', () => {
        const query = heroSearchInput.value.trim();
        if (query) {
            currentSearchQuery = query;
            currentStartIndex = 0;
            currentCategory = '';
            searchBooks(query);
            searchInput.value = query; // Update the navbar search input
        }
    });
    
    // Load more results button
    loadMoreButton.addEventListener('click', () => {
        if (currentCategory) {
            loadMoreCategoryBooks();
        } else {
            loadMoreSearchResults();
        }
    });
    
    // Back to results button
    backToResultsButton.addEventListener('click', () => {
        hideBookDetails();
        if (currentCategory) {
            showCategoryBooks(currentCategory);
        } else if (searchResults.length > 0) {
            showSearchResults();
        } else {
            showHeroSection();
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
        toggleChatSection();
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
    searchResultsContainer.innerHTML = '<div class="spinner-container"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Yükleniyor...</span></div></div>';
    showSearchResults();
    
    // Call the API
    window.bookApi.searchBooks(query, currentStartIndex)
        .then(data => {
            // Store results
            searchResults = data.items || [];
            
            // Display results
            displaySearchResults(searchResults);
            
            // Show/hide load more button
            updateLoadMoreButton(data.totalItems);
        })
        .catch(error => {
            searchResultsContainer.innerHTML = `<div class="no-results"><i class="fas fa-exclamation-circle"></i><h3>Hata oluştu</h3><p>${error.message}</p></div>`;
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
        const bookData = window.bookApi.formatBookData(book);
        const bookElement = createBookCard(bookData);
        searchResultsContainer.appendChild(bookElement);
    });
}

/**
 * Create a book card element
 * @param {Object} bookData - Formatted book data
 * @returns {HTMLElement} - Book card element
 */
function createBookCard(bookData) {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-3 col-sm-6 mb-4';
    
    colDiv.innerHTML = `
        <div class="card book-card h-100" data-book-id="${bookData.id}">
            <img src="${bookData.coverUrl}" class="card-img-top" alt="${bookData.title}">
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
        showBookDetails(bookData.id);
    });
    
    return colDiv;
}

/**
 * Generate HTML for star rating
 * @param {number} rating - Rating value (0-5)
 * @returns {string} - HTML for star rating
 */
function getStarRatingHTML(rating) {
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
    window.bookApi.searchBooks(currentSearchQuery, currentStartIndex)
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
    bookCoverContainer.innerHTML = '<div class="spinner-container"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Yükleniyor...</span></div></div>';
    bookInfoContainer.innerHTML = '';
    
    // Hide other sections and show book details section
    hideAllSections();
    bookDetailsSection.style.display = 'block';
    bookReviewsSection.style.display = 'block';
    
    // Call the API
    window.bookApi.getBookDetails(bookId)
        .then(book => {
            displayBookDetails(book);
            displayBookReviews(bookId);
            // Update reading list UI for this book
            updateBookDetailsReadingListUI(bookId);
        })
        .catch(error => {
            console.error('Error fetching book details:', error);
            bookInfoContainer.innerHTML = `<div class="alert alert-danger">Kitap detayları yüklenirken bir hata oluştu: ${error.message}</div>`;
        });
}

/**
 * Display book details in the UI
 * @param {Object} book - Book object from API
 */
function displayBookDetails(book) {
    const bookData = window.bookApi.formatBookData(book);
    
    // Display book cover
    bookCoverContainer.innerHTML = `
        <img src="${bookData.largeCoverUrl}" alt="${bookData.title}" class="img-fluid">
        <div class="mt-3">
            <a href="${bookData.previewLink}" target="_blank" class="btn btn-outline-primary btn-sm w-100">
                <i class="fas fa-book-open me-2"></i>Önizleme
            </a>
        </div>
    `;
    
    // Dispatch event for book chat integration
    const event = new CustomEvent('bookDetailsLoaded', {
        detail: {
            bookId: book.id,
            bookTitle: bookData.title
        }
    });
    document.dispatchEvent(event);
    
    // Display book info
    bookInfoContainer.innerHTML = `
        <div class="book-info">
            <h1>${bookData.title}</h1>
            <p class="author">Yazar: ${bookData.authors}</p>
            <div class="rating mb-3">
                ${getStarRatingHTML(bookData.averageRating)}
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
    const reviews = getReviews(bookId);
    
    // Clear previous reviews
    reviewsContainer.innerHTML = '';
    
    if (reviews.length === 0) {
        reviewsContainer.innerHTML = '<div class="alert alert-info">Bu kitap için henüz yorum yapılmamış. İlk yorumu siz yapın!</div>';
        return;
    }
    
    // Create HTML for each review
    reviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'card review-card';
        
        reviewElement.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h5 class="card-title reviewer mb-0">${review.name}</h5>
                    <span class="date">${formatDate(review.date)}</span>
                </div>
                <div class="rating mb-2">
                    ${getStarRatingHTML(review.rating)}
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
        alert('Lütfen tüm alanları doldurun.');
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
    addReviewToStorage(currentBookId, review);
    
    // Display updated reviews
    displayBookReviews(currentBookId);
    
    // Reset form
    reviewForm.reset();
}

/**
 * Get reviews from local storage
 * @param {string} bookId - Book ID
 * @returns {Array} - Array of review objects
 */
function getReviews(bookId) {
    if (reviewsData[bookId]) {
        return reviewsData[bookId];
    }
    
    // Try to get from localStorage
    const storedReviews = localStorage.getItem(`kitapsever_reviews_${bookId}`);
    if (storedReviews) {
        reviewsData[bookId] = JSON.parse(storedReviews);
        return reviewsData[bookId];
    }
    
    return [];
}

/**
 * Add review to storage
 * @param {string} bookId - Book ID
 * @param {Object} review - Review object
 */
function addReviewToStorage(bookId, review) {
    const reviews = getReviews(bookId);
    reviews.push(review);
    reviewsData[bookId] = reviews;
    
    // Save to localStorage
    localStorage.setItem(`kitapsever_reviews_${bookId}`, JSON.stringify(reviews));
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Show category books
 * @param {string} category - Category name
 */
function showCategoryBooks(category) {
    // Show loading state
    searchResultsContainer.innerHTML = '<div class="spinner-container"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Yükleniyor...</span></div></div>';
    showSearchResults();
    
    // Update section title
    const sectionTitle = searchResultsSection.querySelector('h2');
    sectionTitle.textContent = getCategoryDisplayName(category) + ' Kitapları';
    
    // Call the API
    window.bookApi.searchBooksByCategory(category, currentStartIndex)
        .then(data => {
            // Store results
            searchResults = data.items || [];
            
            // Display results
            displaySearchResults(searchResults);
            
            // Show/hide load more button
            updateLoadMoreButton(data.totalItems);
        })
        .catch(error => {
            searchResultsContainer.innerHTML = `<div class="no-results"><i class="fas fa-exclamation-circle"></i><h3>Hata oluştu</h3><p>${error.message}</p></div>`;
        });
}

/**
 * Get category display name
 * @param {string} category - Category name
 * @returns {string} - Display name
 */
function getCategoryDisplayName(category) {
    const categoryMap = {
        'fiction': 'Kurgu',
        'nonfiction': 'Kurgu Dışı',
        'science': 'Bilim',
        'history': 'Tarih',
        'biography': 'Biyografi',
        'fantasy': 'Fantastik',
        'mystery': 'Gizem',
        'romance': 'Romantik'
    };
    
    return categoryMap[category] || category;
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
    window.bookApi.searchBooksByCategory(currentCategory, currentStartIndex)
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
        });
}

/**
 * Load featured books
 */
function loadFeaturedBooks() {
    // Show loading state
    featuredBooksContainer.innerHTML = '<div class="spinner-container"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Yükleniyor...</span></div></div>';
    
    // Call the API
    window.bookApi.getFeaturedBooks()
        .then(data => {
            // Extract items array from response
            const books = data.items || [];
            // Display featured books
            displayFeaturedBooks(books);
        })
        .catch(error => {
            console.error('Error loading featured books:', error);
            featuredBooksContainer.innerHTML = `<div class="col-12 text-center"><div class="alert alert-danger">Öne çıkan kitaplar yüklenirken bir hata oluştu: ${error.message}</div></div>`;
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
        featuredBooksContainer.innerHTML = '<div class="col-12 text-center"><div class="alert alert-info">Öne çıkan kitap bulunamadı.</div></div>';
        return;
    }
    
    // Create HTML for each book
    books.forEach(book => {
        const bookData = window.bookApi.formatBookData(book);
        const bookElement = createBookCard(bookData);
        featuredBooksContainer.appendChild(bookElement);
    });
}

/**
 * Show search results section
 */
function showSearchResults() {
    hideAllSections();
    searchResultsSection.style.display = 'block';
}

/**
 * Show hero section
 */
function showHeroSection() {
    hideAllSections();
    heroSection.style.display = 'block';
    categorySection.style.display = 'block';
    document.getElementById('featured-books-section').style.display = 'block';
}

/**
 * Hide book details
 */
function hideBookDetails() {
    bookDetailsSection.style.display = 'none';
    bookReviewsSection.style.display = 'none';
}

/**
 * Toggle chat section
 */
function toggleChatSection() {
    if (chatSection.style.display === 'none') {
        hideAllSections();
        chatSection.style.display = 'block';
    } else {
        chatSection.style.display = 'none';
        showHeroSection();
    }
}

/**
 * Initialize chat from localStorage
 */
function initializeChat() {
    // Get chat messages from localStorage
    const storedMessages = localStorage.getItem('kitapsever_chat_messages');
    const messages = storedMessages ? JSON.parse(storedMessages) : [];
    
    // Display messages
    displayChatMessages(messages);
    
    // Add welcome message if no messages
    if (messages.length === 0) {
        const welcomeMessage = {
            user: 'Sistem',
            text: 'Bu bir otomatik yanıttır. Gerçek bir sohbet sistemi için sunucu taraflı bir çözüm gereklidir.',
            time: new Date().toISOString()
        };
        
        addChatMessage(welcomeMessage);
    }
}

/**
 * Display chat messages in the UI
 * @param {Array} messages - Array of message objects
 */
function displayChatMessages(messages) {
    // Clear container
    chatMessages.innerHTML = '';
    
    // Create HTML for each message
    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${message.user === 'Kullanıcı' ? 'user-message' : 'system-message'}`;
        
        messageElement.innerHTML = `
            <div class="message-header">
                <strong>${message.user}</strong>
                <span class="message-time">${formatChatTime(message.time)}</span>
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
 * Format chat time for display
 * @param {string} timeString - ISO time string
 * @returns {string} - Formatted time string
 */
function formatChatTime(timeString) {
    const date = new Date(timeString);
    return date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Send chat message
 */
function sendChatMessage() {
    const text = chatInput.value.trim();
    
    if (!text) {
        return;
    }
    
    // Create message object
    const userMessage = {
        user: 'Kullanıcı',
        text,
        time: new Date().toISOString()
    };
    
    // Add user message
    addChatMessage(userMessage);
    
    // Clear input
    chatInput.value = '';
    
    // Add system response after a short delay
    setTimeout(() => {
        const systemMessage = {
            user: 'Sistem',
            text: 'Bu bir otomatik yanıttır. Gerçek bir sohbet sistemi için sunucu taraflı bir çözüm gereklidir.',
            time: new Date().toISOString()
        };
        
        addChatMessage(systemMessage);
    }, 1000);
}

/**
 * Add chat message to UI and localStorage
 * @param {Object} message - Message object
 */
function addChatMessage(message) {
    // Get existing messages
    const storedMessages = localStorage.getItem('kitapsever_chat_messages');
    const messages = storedMessages ? JSON.parse(storedMessages) : [];
    
    // Add new message
    messages.push(message);
    
    // Save to localStorage
    localStorage.setItem('kitapsever_chat_messages', JSON.stringify(messages));
    
    // Display updated messages
    displayChatMessages(messages);
}

/**
 * Hide all content sections
 */
function hideAllSections() {
    heroSection.style.display = 'none';
    searchResultsSection.style.display = 'none';
    bookDetailsSection.style.display = 'none';
    bookReviewsSection.style.display = 'none';
    chatSection.style.display = 'none';
    categorySection.style.display = 'none';
    document.getElementById('featured-books-section').style.display = 'none';
    
    // Hide reading list section if it exists
    const readingListSection = document.getElementById('reading-list-section');
    if (readingListSection) {
        readingListSection.style.display = 'none';
    }
}
