const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Kullanıcı şeması
 * firstName: Kullanıcının adı
 * lastName: Kullanıcının soyadı
 * email: Kullanıcının email adresi (benzersiz olmalı)
 * password: Kullanıcının şifresi (hash'lenmiş olarak saklanır)
 * createdAt: Kullanıcının kayıt tarihi
 */
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Ad alanı zorunludur'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Soyad alanı zorunludur'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email alanı zorunludur'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Lütfen geçerli bir email adresi giriniz']
  },
  password: {
    type: String,
    required: [true, 'Şifre alanı zorunludur'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Kullanıcı kaydedilmeden önce şifreyi hash'le
 */
userSchema.pre('save', async function(next) {
  // Şifre değişmediyse hash'leme işlemini atla
  if (!this.isModified('password')) return next();
  
  try {
    // Şifreyi hash'le (10 rounds)
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Şifre doğrulama metodu
 * @param {string} candidatePassword - Kontrol edilecek şifre
 * @returns {boolean} - Şifre doğru ise true, yanlış ise false
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
