'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'user_type', {
      type: Sequelize.ENUM('user', 'admin'),
      defaultValue: 'user'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'user_type');
  }
};
