FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npx sequelize-cli db:migrate

COPY . .

EXPOSE 8005
CMD ["npm", "run","dev"]
