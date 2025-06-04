/**
 * Dark Mode functionality for Kitapsever Website
 * Enables users to toggle between light and dark themes
 */

// Constants
const STORAGE_KEY = 'kitapsever_dark_mode';
const DARK_MODE_CLASS = 'dark-mode';

/**
 * Initialize dark mode functionality
 */
function initializeDarkMode() {
    // Create toggle button
    createDarkModeToggle();
    
    // Apply saved preference
    applySavedThemePreference();
    
    // Listen for changes in other tabs/windows
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
            applyTheme(e.newValue === 'true');
        }
    });
}

/**
 * Create dark mode toggle button
 */
function createDarkModeToggle() {
    const toggleButton = document.createElement('button');
    toggleButton.className = 'theme-toggle';
    toggleButton.id = 'theme-toggle';
    toggleButton.setAttribute('aria-label', 'Tema değiştir');
    toggleButton.setAttribute('title', 'Tema değiştir');
    
    // Set initial icon based on current theme
    const isDarkMode = localStorage.getItem(STORAGE_KEY) === 'true';
    toggleButton.innerHTML = isDarkMode 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
    
    // Add click event
    toggleButton.addEventListener('click', toggleDarkMode);
    
    // Add to body
    document.body.appendChild(toggleButton);
}

/**
 * Toggle between light and dark mode
 */
function toggleDarkMode() {
    const isDarkMode = document.documentElement.classList.contains(DARK_MODE_CLASS);
    const newMode = !isDarkMode;
    
    // Save preference
    localStorage.setItem(STORAGE_KEY, newMode);
    
    // Apply theme
    applyTheme(newMode);
}

/**
 * Apply saved theme preference
 */
function applySavedThemePreference() {
    const savedPreference = localStorage.getItem(STORAGE_KEY);
    
    // Check if user has a saved preference
    if (savedPreference !== null) {
        applyTheme(savedPreference === 'true');
    } else {
        // Check for system preference if no saved preference
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDarkMode);
        localStorage.setItem(STORAGE_KEY, prefersDarkMode);
    }
}

/**
 * Apply theme based on dark mode state
 * @param {boolean} isDarkMode - Whether to apply dark mode
 */
function applyTheme(isDarkMode) {
    // Apply class to html element
    if (isDarkMode) {
        document.documentElement.classList.add(DARK_MODE_CLASS);
    } else {
        document.documentElement.classList.remove(DARK_MODE_CLASS);
    }
    
    // Update toggle button icon
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
        toggleButton.innerHTML = isDarkMode 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    }
}

// Initialize dark mode when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDarkMode);
