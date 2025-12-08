require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "pos_system",
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false
  }
};
