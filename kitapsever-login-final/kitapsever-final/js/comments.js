/**
 * comments.js - Kitapsever yorum sistemi için JavaScript dosyası
 * Bu dosya yorum ekleme ve görüntüleme işlemlerini yönetir
 * JWT token ile korumalı işlemleri içerir
 */

// API URL'i (backend sunucu adresi)
const COMMENTS_API_URL = 'http://localhost:3000/api';

// DOM yüklendikten sonra çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    // Yorum formu varsa event listener ekle
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
        
        // Kullanıcı giriş yapmışsa isim alanını doldur
        updateReviewForm();
    }
});

/**
 * Yorum formunu kullanıcı durumuna göre günceller
 */
function updateReviewForm() {
    const reviewForm = document.getElementById('review-form');
    if (!reviewForm) return;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    const reviewerNameInput = document.getElementById('reviewer-name');
    
    if (token && user.firstName) {
        // Kullanıcı giriş yapmışsa, isim alanını otomatik doldur
        if (reviewerNameInput) {
            reviewerNameInput.value = `${user.firstName} ${user.lastName}`;
            reviewerNameInput.readOnly = true;
        }
    } else {
        // Kullanıcı giriş yapmamışsa, isim alanını düzenlenebilir yap
        if (reviewerNameInput) {
            reviewerNameInput.readOnly = false;
        }
    }
}

/**
 * Yorum gönderme işlemini gerçekleştirir
 * @param {Event} e - Form submit olayı
 */
async function handleReviewSubmit(e) {
    e.preventDefault();
    
    const bookId = getCurrentBookId(); // Mevcut kitap ID'sini al
    if (!bookId) {
        showAlert('Kitap bilgisi bulunamadı', 'danger');
        return;
    }
    
    const username = document.getElementById('reviewer-name').value;
    const rating = document.getElementById('review-rating').value;
    const text = document.getElementById('review-text').value;
    
    // Kullanıcı giriş yapmış mı kontrol et
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };
    
    // Eğer token varsa Authorization header'ı ekle
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(`${COMMENTS_API_URL}/comments`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                bookId,
                username,
                rating: parseInt(rating),
                text
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            // Eğer yetkilendirme hatası varsa login sayfasına yönlendir
            if (response.status === 401) {
                showAlert('Bu işlem için giriş yapmanız gerekiyor', 'warning');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }
            
            showAlert(data.message || 'Yorum eklenirken bir hata oluştu', 'danger');
            return;
        }
        
        // Başarılı yorum ekleme
        showAlert('Yorumunuz başarıyla eklendi', 'success');
        
        // Formu temizle
        document.getElementById('review-rating').value = '';
        document.getElementById('review-text').value = '';
        
        // Yorumları yeniden yükle
        loadComments(bookId);
        
    } catch (error) {
        console.error('Yorum gönderme hatası:', error);
        showAlert('Bir bağlantı hatası oluştu. Lütfen tekrar deneyin.', 'danger');
    }
}

/**
 * Belirli bir kitaba ait yorumları yükler
 * @param {string} bookId - Kitap ID'si
 */
async function loadComments(bookId) {
    if (!bookId) return;
    
    const commentsContainer = document.getElementById('reviews-container');
    if (!commentsContainer) return;
    
    try {
        const response = await fetch(`${COMMENTS_API_URL}/comments/${bookId}`);
        const comments = await response.json();
        
        if (!response.ok) {
            commentsContainer.innerHTML = `<div class="alert alert-warning">Yorumlar yüklenirken bir hata oluştu</div>`;
            return;
        }
        
        if (comments.length === 0) {
            commentsContainer.innerHTML = `<div class="alert alert-info">Bu kitap için henüz yorum yapılmamış</div>`;
            return;
        }
        
        // Yorumları göster
        let html = '';
        comments.forEach(comment => {
            const date = new Date(comment.createdAt).toLocaleDateString('tr-TR');
            const stars = '★'.repeat(comment.rating) + '☆'.repeat(5 - comment.rating);
            
            html += `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <h5 class="card-title">${comment.username}</h5>
                            <div class="text-warning">${stars}</div>
                        </div>
                        <p class="card-text">${comment.text}</p>
                        <div class="text-muted small">${date}</div>
                    </div>
                </div>
            `;
        });
        
        commentsContainer.innerHTML = html;
        
    } catch (error) {
        console.error('Yorumları yükleme hatası:', error);
        commentsContainer.innerHTML = `<div class="alert alert-danger">Yorumlar yüklenirken bir bağlantı hatası oluştu</div>`;
    }
}

/**
 * Mevcut kitap ID'sini alır
 * @returns {string|null} Kitap ID'si veya null
 */
function getCurrentBookId() {
    // Bu fonksiyon main.js'de tanımlanmış olmalı
    // Burada örnek bir implementasyon
    return window.currentBookId || null;
}

/**
 * Kullanıcıya uyarı mesajı gösterir
 * @param {string} message - Gösterilecek mesaj
 * @param {string} type - Uyarı tipi (success, danger, warning, info)
 */
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Kapat"></button>
    `;
    
    // Uyarıyı sayfaya ekle
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        // 5 saniye sonra otomatik kapat
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 300);
        }, 5000);
    }
}
