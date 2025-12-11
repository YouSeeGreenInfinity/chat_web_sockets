const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');

// Все маршруты требуют аутентификации
router.use(authenticateToken);

// Маршруты сообщений
router.post('/', messageController.sendMessage);
router.get('/', messageController.getMessages);
router.get('/user/:userId', messageController.getUserMessages);
router.delete('/:id', messageController.deleteMessage);

module.exports = router;