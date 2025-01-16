'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RefreshToken extends Model {
    static associate(models) {
      // Define association here
      RefreshToken.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }

  RefreshToken.init({
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // name of Target model
        key: 'id', // key in Target model that we're referencing
      },
    },
  }, {
    sequelize,
    modelName: 'RefreshToken',
    timestamps: true
  });

  return RefreshToken;
};
