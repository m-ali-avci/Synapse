/**
 * auth.js - Kitapsever login sistemi için JavaScript dosyası
 * Bu dosya login ve kayıt işlemlerini yönetir, token işlemlerini gerçekleştirir
 */

// API URL'i (backend sunucu adresi)
const API_URL = 'http://localhost:3000/api/auth';

// DOM yüklendikten sonra çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    // Login formu varsa event listener ekle
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register formu varsa event listener ekle
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Kullanıcı giriş yapmışsa UI'ı güncelle
    updateUI();
});

/**
 * Login formunu işleyen fonksiyon
 * @param {Event} e - Form submit olayı
 */
async function handleLogin(e) {
    e.preventDefault();
    
    // Form verilerini al
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Hata ve başarı mesajlarını temizle
    const errorElement = document.getElementById('login-error');
    const successElement = document.getElementById('login-success');
    errorElement.style.display = 'none';
    successElement.style.display = 'none';
    
    try {
        // API'ye login isteği gönder
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            // Hata durumunda mesaj göster
            errorElement.textContent = data.message || 'Giriş yapılırken bir hata oluştu';
            errorElement.style.display = 'block';
            return;
        }
        
        // Başarılı giriş
        successElement.textContent = 'Giriş başarılı! Yönlendiriliyorsunuz...';
        successElement.style.display = 'block';
        
        // Token'ı localStorage'a kaydet
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Ana sayfaya yönlendir
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Login hatası:', error);
        errorElement.textContent = 'Bir bağlantı hatası oluştu. Lütfen tekrar deneyin.';
        errorElement.style.display = 'block';
    }
}

/**
 * Kayıt formunu işleyen fonksiyon
 * @param {Event} e - Form submit olayı
 */
async function handleRegister(e) {
    e.preventDefault();
    
    // Form verilerini al
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Hata ve başarı mesajlarını temizle
    const errorElement = document.getElementById('register-error');
    const successElement = document.getElementById('register-success');
    errorElement.style.display = 'none';
    successElement.style.display = 'none';
    
    // Şifre kontrolü
    if (password !== confirmPassword) {
        errorElement.textContent = 'Şifreler eşleşmiyor';
        errorElement.style.display = 'block';
        return;
    }
    
    try {
        // API'ye kayıt isteği gönder
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ firstName, lastName, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            // Hata durumunda mesaj göster
            errorElement.textContent = data.message || 'Kayıt olurken bir hata oluştu';
            errorElement.style.display = 'block';
            return;
        }
        
        // Başarılı kayıt
        successElement.textContent = 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...';
        successElement.style.display = 'block';
        
        // Token'ı localStorage'a kaydet
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Ana sayfaya yönlendir
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Kayıt hatası:', error);
        errorElement.textContent = 'Bir bağlantı hatası oluştu. Lütfen tekrar deneyin.';
        errorElement.style.display = 'block';
    }
}

/**
 * Kullanıcının giriş durumuna göre UI'ı günceller
 */
function updateUI() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Navbar'daki login/register/logout butonlarını güncelle
    const navbarNav = document.getElementById('navbarNav');
    if (navbarNav) {
        const authLinks = navbarNav.querySelector('.navbar-nav:last-child');
        
        if (authLinks) {
            if (token) {
                // Kullanıcı giriş yapmış
                authLinks.innerHTML = `
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                            ${user.firstName || 'Kullanıcı'}
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="#">Profilim</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="#" id="logout-button">Çıkış Yap</a></li>
                        </ul>
                    </li>
                `;
                
                // Çıkış butonuna event listener ekle
                const logoutButton = document.getElementById('logout-button');
                if (logoutButton) {
                    logoutButton.addEventListener('click', handleLogout);
                }
            } else {
                // Kullanıcı giriş yapmamış
                authLinks.innerHTML = `
                    <li class="nav-item">
                        <a class="nav-link" href="login.html">Giriş Yap</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="register.html">Kayıt Ol</a>
                    </li>
                `;
            }
        }
    }
    
    // Yorum formunu güncelle
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        const reviewerNameInput = document.getElementById('reviewer-name');
        
        if (token && user.firstName) {
            // Kullanıcı giriş yapmışsa, isim alanını otomatik doldur ve readonly yap
            if (reviewerNameInput) {
                reviewerNameInput.value = `${user.firstName} ${user.lastName}`;
                reviewerNameInput.readOnly = true;
            }
        }
    }
}

/**
 * Çıkış işlemini gerçekleştiren fonksiyon
 */
function handleLogout() {
    // Token ve kullanıcı bilgilerini localStorage'dan sil
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Sayfayı yenile
    window.location.reload();
}

/**
 * JWT token'ı alır
 * @returns {string|null} JWT token veya null
 */
function getToken() {
    return localStorage.getItem('token');
}

/**
 * Kullanıcının giriş yapmış olup olmadığını kontrol eder
 * @returns {boolean} Kullanıcı giriş yapmışsa true, yapmamışsa false
 */
function isLoggedIn() {
    return !!getToken();
}

/**
 * API istekleri için Authorization header'ı ekler
 * @returns {Object} Headers objesi
 */
function getAuthHeaders() {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}

/**
 * Korumalı içeriğe erişim için kullanılır
 * Kullanıcı giriş yapmamışsa login sayfasına yönlendirir
 */
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}
