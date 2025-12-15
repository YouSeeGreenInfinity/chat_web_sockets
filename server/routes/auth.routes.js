const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const verifyAccessToken = require('../middlewares/verifyAccessToken');
const verifyRefreshToken = require('../middlewares/verifyRefreshToken');

const router = Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes (требуют валидный access token)
router.get('/logout', verifyAccessToken, authController.logout);
router.get('/profile', verifyAccessToken, authController.getProfile);
router.put('/profile', verifyAccessToken, authController.updateProfile);
router.put('/change-password', verifyAccessToken, authController.changePassword);

// Check auth using refresh token (для автоматического входа)
router.get('/check', verifyRefreshToken, authController.checkAuth);

module.exports = router;