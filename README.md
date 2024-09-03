Simple Nodejs RestAPI for the Authentication using PostgresSql with middleware -Register -Email Verification -Login with JWT token -Refresh Token -Reset Password

API-endpoints: /auth/register - /auth/login - /auth/refresh-token - /auth/forgot-password - /auth/reset-password

#Basic Commands->Sequelize

For Model :
sequelize model:generate --name ModelName --attributes name:string,email:string

For Migration :
//to create a migration
npx sequelize-cli migration:generate --name add-age-to-user

//migrate
npx sequelize-cli db:migrate

//undo migration
npx sequelize-cli db:migrate:undo

//undo all migration
npx sequelize-cli db:migrate:undo:all

For Seeder :
sequelize seed:generate --name SeederName

//seeding
npx sequelize-cli db:seed:all

//specific seeder
npx sequelize-cli db:seed --seed ModelName

//undo specifics
npx sequelize-cli db:seed:undo --seed demo-user.js
