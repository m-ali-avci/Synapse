const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT token doğrulama middleware'i
 * Protected route'lar için kullanılır
 * 
 * @param {Object} req - Express request objesi
 * @param {Object} res - Express response objesi
 * @param {Function} next - Sonraki middleware'e geçiş fonksiyonu
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Authorization header'ı kontrol et
    if (
      req.headers.authorization && 
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Token'ı al (Bearer kısmını çıkar)
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Token yoksa hata döndür
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Bu işlem için giriş yapmanız gerekiyor'
      });
    }
    
    try {
      // Token'ı doğrula
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'kitapsever-gizli-anahtar'
      );
      
      // Kullanıcıyı bul ve request'e ekle
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Geçersiz token, kullanıcı bulunamadı'
        });
      }
      
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
  } catch (error) {
    console.error('Auth middleware hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};
