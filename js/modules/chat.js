/**
 * Chat Module
 * Manages chat functionality using localStorage
 */

// Chat storage key
const CHAT_STORAGE_KEY = 'kitapsever_chat_messages';

/**
 * Initialize chat messages from localStorage
 * @returns {Array} - Array of chat message objects
 */
export const initializeChat = () => {
    const storedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
    return storedMessages ? JSON.parse(storedMessages) : [];
};

/**
 * Save chat message
 * @param {Object} message - Message object with sender, text, and time
 */
export const saveChatMessage = (message) => {
    const messages = initializeChat();
    messages.push(message);
    
    // Limit to last 100 messages to prevent localStorage overflow
    const limitedMessages = messages.slice(-100);
    
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(limitedMessages));
    
    return limitedMessages;
};

/**
 * Create a user message object
 * @param {string} text - Message text
 * @returns {Object} - Message object
 */
export const createUserMessage = (text) => {
    return {
        sender: 'user',
        text: text,
        time: new Date().toISOString()
    };
};

/**
 * Create a system message object
 * @param {string} text - Message text
 * @returns {Object} - Message object
 */
export const createSystemMessage = (text) => {
    return {
        sender: 'system',
        text: text,
        time: new Date().toISOString()
    };
};

/**
 * Format time for display
 * @param {string} timeString - ISO time string
 * @returns {string} - Formatted time string (HH:MM)
 */
export const formatMessageTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
    });
};
