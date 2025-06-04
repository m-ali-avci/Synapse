/**
 * index.js - Ana sayfa için JavaScript entegrasyonu
 * Bu dosya auth.js ile entegre çalışarak kullanıcı durumuna göre UI'ı günceller
 */

// DOM yüklendikten sonra çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    // Navbar'ı kullanıcı durumuna göre güncelle
    updateNavbar();
    
    // Yorum formunu kullanıcı durumuna göre güncelle
    updateCommentForm();
});

/**
 * Navbar'ı kullanıcı durumuna göre günceller
 */
function updateNavbar() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const navbarNav = document.getElementById('navbarNav');
    if (!navbarNav) return;
    
    // Navbar'ın sağ tarafını seç veya oluştur
    let authLinks = navbarNav.querySelector('.navbar-nav:last-child');
    
    if (!authLinks) {
        // Eğer yoksa oluştur
        authLinks = document.createElement('ul');
        authLinks.className = 'navbar-nav ms-auto';
        navbarNav.appendChild(authLinks);
    }
    
    if (token && user.firstName) {
        // Kullanıcı giriş yapmış
        authLinks.innerHTML = `
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                    <i class="fas fa-user me-1"></i> ${user.firstName || 'Kullanıcı'}
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="#">Profilim</a></li>
                    <li><a class="dropdown-item" href="#" id="reading-list-link">Okuma Listem</a></li>
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
                <a class="nav-link" href="login.html">
                    <i class="fas fa-sign-in-alt me-1"></i> Giriş Yap
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="register.html">
                    <i class="fas fa-user-plus me-1"></i> Kayıt Ol
                </a>
            </li>
        `;
    }
}

/**
 * Yorum formunu kullanıcı durumuna göre günceller
 */
function updateCommentForm() {
    const reviewForm = document.getElementById('review-form');
    if (!reviewForm) return;
    
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const reviewerNameInput = document.getElementById('reviewer-name');
    
    if (token && user.firstName) {
        // Kullanıcı giriş yapmışsa, isim alanını otomatik doldur
        if (reviewerNameInput) {
            reviewerNameInput.value = `${user.firstName} ${user.lastName}`;
            reviewerNameInput.readOnly = true;
        }
    } else {
        // Kullanıcı giriş yapmamışsa, login uyarısı göster
        reviewForm.innerHTML = `
            <div class="alert alert-info">
                Yorum yapabilmek için <a href="login.html">giriş yapmalısınız</a>.
                Hesabınız yoksa <a href="register.html">kayıt olabilirsiniz</a>.
            </div>
        `;
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
