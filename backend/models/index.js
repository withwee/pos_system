const { Sequelize } = require("sequelize");
const bcrypt = require("bcryptjs");
const dbConfig = require("../config/db").development;

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
  }
);

const db = {};
db.sequelize = sequelize;

// Import manual semua model
db.User = require("./user.model")(sequelize);
db.Category = require("./category.model")(sequelize);
db.Unit = require("./unit.model")(sequelize); // ⬅️ TAMBAHAN BARU
db.Product = require("./product.model")(sequelize);
db.Transaction = require("./transaction.model")(sequelize);
db.TransactionItem = require("./transactionItem.model")(sequelize);
db.StockLog = require("./stocek.log.model")(sequelize);

// Setup Associations
// USER → TRANSACTION
db.User.hasMany(db.Transaction, { foreignKey: "userId" });
db.Transaction.belongsTo(db.User, { foreignKey: "userId" });

// CATEGORY → PRODUCT
db.Category.hasMany(db.Product, { foreignKey: "categoryId", as: "products" });
db.Product.belongsTo(db.Category, { foreignKey: "categoryId", as: "category" });

// UNIT → PRODUCT ⬅️ TAMBAHAN BARU
db.Unit.hasMany(db.Product, { foreignKey: "unitId" });
db.Product.belongsTo(db.Unit, { foreignKey: "unitId", as: "unit" });

// TRANSACTION → TRANSACTION ITEMS
db.Transaction.hasMany(db.TransactionItem, { foreignKey: "transactionId" });
db.TransactionItem.belongsTo(db.Transaction, { foreignKey: "transactionId" });

// PRODUCT → TRANSACTION ITEMS
db.Product.hasMany(db.TransactionItem, { foreignKey: "productId" });
db.TransactionItem.belongsTo(db.Product, { foreignKey: "productId" });

// PRODUCT → STOCK LOG
db.Product.hasMany(db.StockLog, { foreignKey: "productId" });
db.StockLog.belongsTo(db.Product, { foreignKey: "productId" });

// USER → STOCK LOG
db.User.hasMany(db.StockLog, { foreignKey: "userId" });
db.StockLog.belongsTo(db.User, { foreignKey: "userId" });

// Fungsi createDefaultAdmin
async function createDefaultAdmin() {
  const admin = await db.User.findOne({ where: { email: "admin@pos.com" } });
  if (!admin) {
    await db.User.create({
      name: "Admin",
      email: "admin@pos.com",
      password: "admin123",
      role: "admin",
    });
    console.log("✅ Default admin created: admin@pos.com / admin123");
  }
}

// Fungsi seedDefaultUnits ⬅️ TAMBAHAN BARU
async function seedDefaultUnits() {
  try {
    const unitCount = await db.Unit.count();

    if (unitCount === 0) {
      const defaultUnits = [
        { name: "Piece", symbol: "pcs", type: "piece" },
        { name: "Kilogram", symbol: "kg", type: "weight" },
        { name: "Gram", symbol: "gr", type: "weight" },
        { name: "Liter", symbol: "L", type: "volume" },
        { name: "Mililiter", symbol: "ml", type: "volume" },
        { name: "Pack", symbol: "pack", type: "package" },
        { name: "Box", symbol: "box", type: "package" },
        { name: "Lusin", symbol: "lusin", type: "package" },
        { name: "Karton", symbol: "karton", type: "package" },
        { name: "Renteng", symbol: "renteng", type: "package" },
        { name: "Ikat", symbol: "ikat", type: "package" },
      ];

      await db.Unit.bulkCreate(defaultUnits);
      console.log("✅ Default units created");
    } else {
      console.log("ℹ️  Units already exist");
    }
  } catch (error) {
    console.error("❌ Error seeding units:", error.message);
  }
}

db.createDefaultAdmin = createDefaultAdmin;
db.seedDefaultUnits = seedDefaultUnits; // ⬅️ TAMBAHAN BARU

module.exports = db;
