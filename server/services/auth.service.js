const bcrypt = require('bcrypt');
const { User } = require('../db/models');

const authService = {
  async registerUser({ username, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    const plainUser = user.get();
    delete plainUser.password;
    
    return plainUser;
  },

  async authenticateUser({ email, password }) {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    const plainUser = user.get();
    delete plainUser.password;
    
    return plainUser;
  },

  async findUserByEmail(email) {
    const user = await User.findOne({ where: { email } });
    
    if (user) {
      const plainUser = user.get();
      delete plainUser.password;
      return plainUser;
    }
    
    return null;
  },

  async findUserById(id) {
    const user = await User.findByPk(id);
    
    if (user) {
      const plainUser = user.get();
      delete plainUser.password;
      return plainUser;
    }
    
    return null;
  },

  async updateUser(userId, updateData) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Удаляем поля, которые нельзя обновлять напрямую
    const { password, ...safeUpdateData } = updateData;
    
    await user.update(safeUpdateData);
    
    const updatedUser = user.get();
    delete updatedUser.password;
    
    return updatedUser;
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedNewPassword });
    
    const updatedUser = user.get();
    delete updatedUser.password;
    
    return updatedUser;
  }
};

module.exports = authService;