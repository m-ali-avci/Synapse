/**
 * Book Chat functionality for Kitapsever Website
 * Enables users to discuss specific books in dedicated chat rooms
 */

// Global variables
let currentBookChat = null;
const STORAGE_KEY_PREFIX = 'kitapsever_book_chat_';

/**
 * Initialize book chat functionality
 */
function initializeBookChat() {
    // Add book chat button to book details page
    document.addEventListener('DOMContentLoaded', () => {
        // This will be called when a book is displayed
        document.addEventListener('bookDetailsLoaded', (e) => {
            addBookChatButton(e.detail.bookId, e.detail.bookTitle);
        });
    });
}

/**
 * Add book chat button to book details
 * @param {string} bookId - Book ID
 * @param {string} bookTitle - Book title
 */
function addBookChatButton(bookId, bookTitle) {
    // Check if button already exists
    if (document.getElementById('book-chat-button')) {
        return;
    }
    
    // Create button
    const button = document.createElement('button');
    button.id = 'book-chat-button';
    button.className = 'btn btn-success mt-3 w-100';
    button.innerHTML = '<i class="fas fa-comments me-2"></i>Bu Kitap Hakkında Sohbet Et';
    
    // Add click event
    button.addEventListener('click', () => {
        openBookChat(bookId, bookTitle);
    });
    
    // Add to book cover container
    const bookCoverContainer = document.getElementById('book-cover-container');
    if (bookCoverContainer) {
        bookCoverContainer.appendChild(button);
    }
}

/**
 * Open book chat for specific book
 * @param {string} bookId - Book ID
 * @param {string} bookTitle - Book title
 */
function openBookChat(bookId, bookTitle) {
    currentBookChat = bookId;
    
    // Hide other sections and show chat section
    hideAllSections();
    chatSection.style.display = 'block';
    
    // Update chat header
    const chatHeader = document.querySelector('#chat-section .card-header h3');
    if (chatHeader) {
        chatHeader.textContent = `Kitap Sohbeti: ${bookTitle}`;
    }
    
    // Load book-specific chat messages
    loadBookChatMessages(bookId);
    
    // Update chat form submission handler
    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
        // Remove existing event listeners
        const newChatForm = chatForm.cloneNode(true);
        chatForm.parentNode.replaceChild(newChatForm, chatForm);
        
        // Add new event listener
        newChatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendBookChatMessage(bookId);
        });
    }
}

/**
 * Load book chat messages
 * @param {string} bookId - Book ID
 */
function loadBookChatMessages(bookId) {
    // Get chat messages from localStorage
    const storageKey = STORAGE_KEY_PREFIX + bookId;
    const storedMessages = localStorage.getItem(storageKey);
    const messages = storedMessages ? JSON.parse(storedMessages) : [];
    
    // Display messages
    displayChatMessages(messages);
    
    // Add welcome message if no messages
    if (messages.length === 0) {
        const welcomeMessage = {
            user: 'Sistem',
            text: 'Bu kitap hakkında sohbet başlatın! Düşüncelerinizi, sorularınızı veya yorumlarınızı paylaşın.',
            time: new Date().toISOString()
        };
        
        addBookChatMessage(bookId, welcomeMessage);
    }
}

/**
 * Send book chat message
 * @param {string} bookId - Book ID
 */
function sendBookChatMessage(bookId) {
    const chatInput = document.getElementById('chat-input');
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
    addBookChatMessage(bookId, userMessage);
    
    // Clear input
    chatInput.value = '';
}

/**
 * Add book chat message to UI and localStorage
 * @param {string} bookId - Book ID
 * @param {Object} message - Message object
 */
function addBookChatMessage(bookId, message) {
    // Get existing messages
    const storageKey = STORAGE_KEY_PREFIX + bookId;
    const storedMessages = localStorage.getItem(storageKey);
    const messages = storedMessages ? JSON.parse(storedMessages) : [];
    
    // Add new message
    messages.push(message);
    
    // Save to localStorage (limit to last 100 messages)
    localStorage.setItem(storageKey, JSON.stringify(messages.slice(-100)));
    
    // Display updated messages
    displayChatMessages(messages);
}

// Initialize book chat
initializeBookChat();
