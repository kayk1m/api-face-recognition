import { Sequelize } from 'sequelize-typescript';
// import 'dotenv/config';

export const sequelize = new Sequelize({
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: 'taeyun',
  host: process.env.DB_HOST_DEV,
  dialect: 'mariadb',
  timezone: process.env.DB_TIMEZONE,
  dialectOptions: {
    charset: 'utf8mb4',
    dateStrings: true,
    typeCast: true,
    timezone: process.env.DB_TIMEZONE,
  },
  models: [`${__dirname}/models`],
  define: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
    timestamps: true,
  },
});
