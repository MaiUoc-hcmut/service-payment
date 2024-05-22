'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('cart', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      id_user: {
        type: Sequelize.UUID
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
    await queryInterface.createTable('transaction', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      id_user: {
        type: Sequelize.UUID
      },
      orderId: {
        type: Sequelize.STRING
      },
      orderType: {
        type: Sequelize.STRING
      },
      payType: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.INTEGER.UNSIGNED
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
    await queryInterface.createTable('transaction_course', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      id_transaction: {
        type: Sequelize.UUID,
        references: {
          model: 'transaction',
          key: 'id'
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        allowNull: false
      },
      id_teacher: {
        type: Sequelize.UUID,
        allowNull: false
      },
      id_course: {
        type: Sequelize.UUID,
      },
      id_combo_exam: {
        type: Sequelize.UUID
      },
      price: {
        type: Sequelize.INTEGER.UNSIGNED
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
    await queryInterface.createTable('cart_course', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      id_cart: {
        type: Sequelize.UUID,
        references: {
          model: 'cart',
          key: 'id'
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        allowNull: false
      },
      id_course: {
        type: Sequelize.UUID,
        allowNull: false
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('cart_course');
    await queryInterface.dropTable('transaction_course');
    await queryInterface.dropTable('transaction');
    await queryInterface.dropTable('cart');
  }
};
