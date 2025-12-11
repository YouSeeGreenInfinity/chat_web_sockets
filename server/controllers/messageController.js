const { Message, User } = require('../models');

const messageController = {
  // Отправить сообщение
  async sendMessage(req, res) {
    try {
      const { content } = req.body;
      const userId = req.user.id;

      if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Message content is required' });
      }

      const message = await Message.create({
        content: content.trim(),
        userId
      });

      // Получаем сообщение с информацией об авторе
      const messageWithUser = await Message.findByPk(message.id, {
        include: [{
          model: User,
          attributes: ['id', 'username', 'email']
        }]
      });

      res.status(201).json({
        message: 'Message sent successfully',
        data: messageWithUser
      });

    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  },

  // Получить все сообщения (с пагинацией)
  async getMessages(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;

      const { count, rows: messages } = await Message.findAndCountAll({
        include: [{
          model: User,
          attributes: ['id', 'username', 'email']
        }],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      res.json({
        messages,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalMessages: count,
          hasMore: offset + messages.length < count
        }
      });

    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  },

  // Получить сообщения конкретного пользователя
  async getUserMessages(req, res) {
    try {
      const userId = req.params.userId || req.user.id;

      const messages = await Message.findAll({
        where: { userId },
        include: [{
          model: User,
          attributes: ['id', 'username']
        }],
        order: [['createdAt', 'DESC']]
      });

      res.json({ messages });

    } catch (error) {
      console.error('Get user messages error:', error);
      res.status(500).json({ error: 'Failed to get user messages' });
    }
  },

  // Удалить сообщение (только свое)
  async deleteMessage(req, res) {
    try {
      const messageId = req.params.id;
      const userId = req.user.id;

      const message = await Message.findByPk(messageId);

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      // Проверяем, что пользователь удаляет свое сообщение
      if (message.userId !== userId) {
        return res.status(403).json({ error: 'You can only delete your own messages' });
      }

      await message.destroy();

      res.json({ message: 'Message deleted successfully' });

    } catch (error) {
      console.error('Delete message error:', error);
      res.status(500).json({ error: 'Failed to delete message' });
    }
  }
};

module.exports = messageController;