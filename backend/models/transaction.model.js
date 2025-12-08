const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Transaction = sequelize.define("Transaction", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    transactionNumber: {
      type: DataTypes.STRING,
      unique: true
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    paymentMethod: {
      type: DataTypes.ENUM("cash", "qris", "debit", "credit"),
      allowNull: false
    },
    customerName: {
      type: DataTypes.STRING
    }
  });

  return Transaction;
};
