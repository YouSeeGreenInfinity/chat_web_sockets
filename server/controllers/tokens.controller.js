const generateTokens = require('../utils/generateTokens');
const cookiesConfig = require('../config/cookiesConfig');

const tokensController = {
  refreshTokens(req, res) {
    try {
      // Пользователь уже добавлен в res.locals middleware verifyRefreshToken
      const { user } = res.locals;

      // Генерация новых токенов
      const { accessToken, refreshToken } = generateTokens({ user });

      // Отправка ответа
      return res
        .cookie('refreshToken', refreshToken, cookiesConfig.refresh)
        .status(200)
        .json({ 
          accessToken, 
          user,
          message: 'Tokens refreshed successfully'
        });

    } catch (error) {
      console.error('Refresh tokens error:', error);
      return res.status(500).json({ 
        message: 'Failed to refresh tokens',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = tokensController;