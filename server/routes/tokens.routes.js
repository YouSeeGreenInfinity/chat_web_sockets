const { Router } = require('express');
const tokensController = require('../controllers/tokens.controller');
const verifyRefreshToken = require('../middlewares/verifyRefreshToken');

const router = Router();

// Refresh tokens
router.get('/refresh', verifyRefreshToken, tokensController.refreshTokens);

module.exports = router;