const { sequelize } = require('../../models');

const setupTestDb = () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    beforeEach(async () => {
        await Promise.all(
            Object.values(sequelize.models).map(model => model.destroy({
                where: {},
                truncate: true,
                cascade: true,
                restartIdentity: true
            }))
        );
    });

    afterAll(async () => {
        await sequelize.close();
    });
};

module.exports = setupTestDb; 