const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authController = {
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // Проверка существования пользователя
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Хэширование пароля
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Создание пользователя
      const user = await User.create({
        username,
        email,
        password_hash: passwordHash
      });

      // Генерация токенов
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        accessToken,
        refreshToken
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      console.log('🔐 Login attempt for:', email);

      // Поиск пользователя
      const user = await User.findOne({ where: { email } });
      if (!user) {
        console.log('❌ User not found');
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      console.log('✅ User found, checking password...');
      console.log('🔑 Password hash in DB:', user.password_hash.substring(0, 30) + '...');
      console.log('📝 Input password:', password);

      // ВАЖНО: Используем bcrypt.compare для проверки
      const validPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!validPassword) {
        console.log('❌ Password mismatch');
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      console.log('✅ Password correct!');

      // Создание JWT токена
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' } // Увеличил для удобства разработки
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        accessToken,
        refreshToken
      });

    } catch (error) {
      console.error('❌ Login error:', error);
      res.status(500).json({ error: 'Login failed', details: error.message });
    }
  },

  async getProfile(req, res) {
    try {
      res.json({
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          createdAt: req.user.createdAt
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  },

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
      }

      // Простая реализация для разработки
      // В продакшене нужно проверять refresh token в БД
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) {
          return res.status(403).json({ error: 'Invalid refresh token' });
        }

        const accessToken = jwt.sign(
          { id: decoded.id, email: decoded.email, username: decoded.username },
          process.env.JWT_SECRET,
          { expiresIn: '15m' }
        );

        res.json({ accessToken });
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({ error: 'Token refresh failed' });
    }
  }
};

module.exports = authController;