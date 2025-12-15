// backend/models/stocek.log.model.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const StockLog = sequelize.define(
    "StockLog",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("IN", "OUT", "ADJUST"),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      beforeStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      afterStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      source: {
        type: DataTypes.ENUM("SALE", "RESTOCK", "MANUAL"),
        allowNull: false,
      },
      note: {
        type: DataTypes.STRING,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: "stock_logs",
      timestamps: true,
    }
  );

  // Associations
  StockLog.associate = (models) => {
    StockLog.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
    });

    StockLog.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return StockLog;
};