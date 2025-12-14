module.exports = (sequelize, DataTypes) => {
  const StockLog = sequelize.define("StockLog", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    type: {
      type: DataTypes.ENUM("IN", "OUT", "ADJUST"),
      allowNull: false
    },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    beforeStock: { type: DataTypes.INTEGER, allowNull: false },
    afterStock: { type: DataTypes.INTEGER, allowNull: false },
    source: {
      type: DataTypes.ENUM("SALE", "RESTOCK", "MANUAL"),
      allowNull: false
    },
    note: DataTypes.STRING,
    userId: DataTypes.INTEGER
  });

  return StockLog;
};
