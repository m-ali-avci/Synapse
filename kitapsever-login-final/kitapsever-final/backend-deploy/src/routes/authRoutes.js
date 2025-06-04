const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Kullanıcı kaydı route'u
 * POST /api/auth/register
 * Public
 */
router.post('/register', authController.register);

/**
 * Kullanıcı girişi route'u
 * POST /api/auth/login
 * Public
 */
router.post('/login', authController.login);

/**
 * Mevcut kullanıcı bilgilerini getir
 * GET /api/auth/me
 * Private - Sadece giriş yapmış kullanıcılar erişebilir
 */
router.get('/me', protect, authController.getCurrentUser);

module.exports = router;
