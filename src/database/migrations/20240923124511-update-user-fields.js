'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'phn_no', {
      type: Sequelize.BIGINT,  // Update phn_no to BIGINT
      allowNull: true,         // Allow null values
      defaultValue: null       // Set default value to null
    });

    await queryInterface.addColumn('Users', 'about', {
      type: Sequelize.TEXT,    // Update about to TEXT
      allowNull: true,         // Allow null values
      defaultValue: null       // Set default value to null
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert changes if needed
    await queryInterface.removeColumn('Users', 'phn_no');

    await queryInterface.removeColumn('Users', 'about');
  }
};
