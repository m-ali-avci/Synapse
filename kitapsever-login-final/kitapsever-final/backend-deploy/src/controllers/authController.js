const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT token üretme fonksiyonu
 * @param {Object} user - Kullanıcı objesi
 * @returns {string} - Üretilen JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    },
    process.env.JWT_SECRET || 'kitapsever-gizli-anahtar',
    { expiresIn: '24h' } // Token 24 saat geçerli
  );
};

/**
 * Kullanıcı kaydı controller fonksiyonu
 * @param {Object} req - Express request objesi
 * @param {Object} res - Express response objesi
 */
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Email ile kayıtlı kullanıcı var mı kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bu email adresi zaten kullanılıyor' 
      });
    }

    // Yeni kullanıcı oluştur
    const newUser = new User({
      firstName,
      lastName,
      email,
      password
    });

    // Kullanıcıyı kaydet (şifre otomatik hash'lenir)
    await newUser.save();

    // JWT token üret
    const token = generateToken(newUser);

    // Başarılı yanıt döndür
    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla kaydedildi',
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Kayıt işlemi sırasında bir hata oluştu' 
    });
  }
};

/**
 * Kullanıcı girişi controller fonksiyonu
 * @param {Object} req - Express request objesi
 * @param {Object} res - Express response objesi
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Email ile kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Geçersiz email veya şifre' 
      });
    }

    // Şifreyi kontrol et
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Geçersiz email veya şifre' 
      });
    }

    // JWT token üret
    const token = generateToken(user);

    // Başarılı yanıt döndür
    res.status(200).json({
      success: true,
      message: 'Giriş başarılı',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Giriş işlemi sırasında bir hata oluştu' 
    });
  }
};

/**
 * Mevcut kullanıcı bilgilerini getir
 * @param {Object} req - Express request objesi
 * @param {Object} res - Express response objesi
 */
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user middleware tarafından eklenir
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Kullanıcı bulunamadı' 
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Kullanıcı bilgileri hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Kullanıcı bilgileri alınırken bir hata oluştu' 
    });
  }
};
