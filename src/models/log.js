'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Log extends Model {
        static associate(models) {
            // Define associations if needed
        }
    }

    Log.init({
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'API_REQUEST',
            validate: {
                isIn: [['API_REQUEST', 'API_ERROR', 'SYSTEM']]
            }
        },
        method: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'SYSTEM']]
            }
        },
        endpoint: {
            type: DataTypes.STRING,
            allowNull: false
        },
        statusCode: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        responseTime: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Response time in milliseconds'
        },
        ip: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userAgent: {
            type: DataTypes.STRING,
            allowNull: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        requestBody: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        requestQuery: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        responseBody: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        error: {
            type: DataTypes.JSONB,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Log',
        tableName: 'logs',
        indexes: [
            {
                fields: ['type']
            },
            {
                fields: ['method']
            },
            {
                fields: ['endpoint']
            },
            {
                fields: ['statusCode']
            },
            {
                fields: ['userId']
            },
            {
                fields: ['createdAt']
            }
        ]
    });

    return Log;
};