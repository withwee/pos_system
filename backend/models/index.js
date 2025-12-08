const { Sequelize } = require("sequelize");
const dbConfig = require("../config/db").development;

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging
  }
);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// =======================
// REGISTER MODELS
// =======================
db.User = require("./user.model")(sequelize);
db.Category = require("./category.model")(sequelize);
db.Product = require("./product.model")(sequelize);
db.Transaction = require("./transaction.model")(sequelize);
db.TransactionItem = require("./transactionItem.model")(sequelize);

// =======================
// MODEL RELATIONS
// =======================

// USER → TRANSACTION (kasir membuat transaksi)
db.User.hasMany(db.Transaction, { foreignKey: "userId" });
db.Transaction.belongsTo(db.User, { foreignKey: "userId" });

// CATEGORY → PRODUCT
db.Category.hasMany(db.Product, { foreignKey: "categoryId" });
db.Product.belongsTo(db.Category, { foreignKey: "categoryId" });

// TRANSACTION → TRANSACTION ITEMS
db.Transaction.hasMany(db.TransactionItem, { foreignKey: "transactionId" });
db.TransactionItem.belongsTo(db.Transaction, { foreignKey: "transactionId" });

// PRODUCT → TRANSACTION ITEMS
db.Product.hasMany(db.TransactionItem, { foreignKey: "productId" });
db.TransactionItem.belongsTo(db.Product, { foreignKey: "productId" });

async function createDefaultAdmin() {
  const admin = await db.User.findOne({ where: { email: "admin@pos.com" } });
  if (!admin) {
    await db.User.create({
      name: "Admin",
      email: "admin@pos.com",
      password: "admin123",
      role: "admin"
    });
    console.log("Default admin created: admin@pos.com / admin123");
  }
}

db.createDefaultAdmin = createDefaultAdmin;

module.exports = db;
