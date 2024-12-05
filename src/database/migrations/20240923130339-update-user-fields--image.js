'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'user_image', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,  // Set default value to null
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'user_image');
  }
};
