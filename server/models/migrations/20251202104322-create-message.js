"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Messages", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false, // ← сообщение должно быть от пользователя
        references: {
          // ← внешний ключ на таблицу Users
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE", // ← удалить сообщения при удалении пользователя
        onUpdate: "CASCADE", // ← обновить userId при изменении id пользователя
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // 🔧 Добавляем индекс для быстрого поиска сообщений по пользователю
    await queryInterface.addIndex("Messages", ["userId"], {
      name: "messages_user_id_index",
    });

    // 📅 Индекс для сортировки по дате (если будете часто получать свежие сообщения)
    await queryInterface.addIndex("Messages", ["createdAt"], {
      name: "messages_created_at_index",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Messages");
  },
};
