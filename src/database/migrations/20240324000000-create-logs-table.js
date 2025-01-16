'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('logs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'API_REQUEST'
            },
            method: {
                type: Sequelize.STRING,
                allowNull: false
            },
            endpoint: {
                type: Sequelize.STRING,
                allowNull: false
            },
            statusCode: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            responseTime: {
                type: Sequelize.INTEGER,
                allowNull: false,
                comment: 'Response time in milliseconds'
            },
            ip: {
                type: Sequelize.STRING,
                allowNull: false
            },
            userAgent: {
                type: Sequelize.STRING,
                allowNull: true
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Users',
                    key: 'id'
                }
            },
            requestBody: {
                type: Sequelize.JSONB,
                allowNull: true
            },
            requestQuery: {
                type: Sequelize.JSONB,
                allowNull: true
            },
            responseBody: {
                type: Sequelize.JSONB,
                allowNull: true
            },
            error: {
                type: Sequelize.JSONB,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            }
        });

        // Add indexes
        await queryInterface.addIndex('logs', ['type']);
        await queryInterface.addIndex('logs', ['method']);
        await queryInterface.addIndex('logs', ['endpoint']);
        await queryInterface.addIndex('logs', ['statusCode']);
        await queryInterface.addIndex('logs', ['userId']);
        await queryInterface.addIndex('logs', ['createdAt']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('logs');
    }
};