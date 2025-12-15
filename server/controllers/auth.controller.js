const authService = require('../services/auth.service');
const generateTokens = require('../utils/generateTokens');
const cookiesConfig = require('../config/cookiesConfig');

const authController = {
  async signup(req, res) {
    try {
      const { username, email, password } = req.body;

      // Валидация входных данных
      if (!username || !email || !password) {
        return res.status(400).json({ 
          message: 'All fields are required' 
        });
      }

      // Дополнительная валидация email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          message: 'Invalid email format' 
        });
      }

      // Проверка сложности пароля
      if (password.length < 6) {
        return res.status(400).json({ 
          message: 'Password must be at least 6 characters long' 
        });
      }

      // Используем сервис для регистрации
      const user = await authService.registerUser({
        username, 
        email, 
        password
      });

      // Генерация токенов
      const { accessToken, refreshToken } = generateTokens({ user });

      // Отправка ответа
      return res
        .cookie('refreshToken', refreshToken, cookiesConfig.refresh)
        .status(201)
        .json({ 
          success: true,
          accessToken, 
          user,
          message: 'User registered successfully'
        });

    } catch (error) {
      // Обработка конкретных ошибок
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ 
          success: false,
          message: 'User with this email already exists' 
        });
      }

      if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(err => err.message);
        return res.status(400).json({ 
          success: false,
          message: 'Validation error',
          errors: messages
        });
      }
      
      console.error('Signup error:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Валидация
      if (!email || !password) {
        return res.status(400).json({ 
          success: false,
          message: 'Email and password are required' 
        });
      }

      // Используем сервис для аутентификации
      const user = await authService.authenticateUser({ email, password });

      // Генерация токенов
      const { accessToken, refreshToken } = generateTokens({ user });

      // Отправка ответа
      return res
        .cookie('refreshToken', refreshToken, cookiesConfig.refresh)
        .status(200)
        .json({ 
          success: true,
          accessToken, 
          user,
          message: 'Login successful'
        });

    } catch (error) {
      // Обработка ошибок аутентификации
      if (error.message === 'User not found' || error.message === 'Invalid password') {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid email or password'  // Общее сообщение для безопасности
        });
      }

      console.error('Login error:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async logout(req, res) {
    try {
      // Получаем refreshToken из куки для возможной инвалидации
      const refreshToken = req.cookies.refreshToken;
      
      // Здесь можно добавить логику для инвалидации токена в БД
      // Например, добавить в черный список

      return res
        .clearCookie('refreshToken')
        .status(200)
        .json({ 
          success: true,
          message: 'Logout successful' 
        });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async checkAuth(req, res) {
    try {
      // Пользователь уже должен быть в res.locals благодаря middleware
      // Но добавим проверку на случай, если middleware не использовалось
      if (!res.locals.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      return res.status(200).json({ 
        success: true,
        user: res.locals.user,
        message: 'Authentication check successful'
      });
    } catch (error) {
      console.error('Check auth error:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async getProfile(req, res) {
    try {
      // В реальном приложении можно получить userId из токена
      // или использовать middleware для аутентификации
      if (!res.locals.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const user = res.locals.user;
      
      // Можно добавить дополнительную информацию о пользователе
      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
          // Не включаем пароль и другие чувствительные данные
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  },

  async updateProfile(req, res) {
    try {
      if (!res.locals.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userId = res.locals.user.id;
      const { username, email } = req.body;

      // Валидация
      if (!username && !email) {
        return res.status(400).json({
          success: false,
          message: 'No data provided for update'
        });
      }

      // Проверка email на уникальность, если он меняется
      if (email && email !== res.locals.user.email) {
        const existingUser = await authService.findUserByEmail(email);
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: 'Email already in use'
          });
        }
      }

      // Обновление пользователя (добавьте метод в сервис)
      const updatedUser = await authService.updateUser(userId, { username, email });

      // Если обновили email, нужно перегенерировать токены
      let newTokens = null;
      if (email && email !== res.locals.user.email) {
        const { accessToken, refreshToken } = generateTokens({ user: updatedUser });
        newTokens = { accessToken, refreshToken };
        
        res.cookie('refreshToken', refreshToken, cookiesConfig.refresh);
      }

      return res.status(200).json({
        success: true,
        user: updatedUser,
        tokens: newTokens,
        message: 'Profile updated successfully'
      });

    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  },

  async changePassword(req, res) {
    try {
      if (!res.locals.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userId = res.locals.user.id;
      const { currentPassword, newPassword } = req.body;

      // Валидация
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }

      // Проверка текущего пароля и обновление
      const updatedUser = await authService.changePassword(
        userId, 
        currentPassword, 
        newPassword
      );

// 

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      if (error.message === 'Current password is incorrect') {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      console.error('Change password error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  }
};

module.exports = authController;