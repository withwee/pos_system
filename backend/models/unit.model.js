const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Unit = sequelize.define(
    "Unit",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      symbol: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("weight", "volume", "piece", "package"),
        allowNull: false,
      },
    },
    {
      tableName: "units",
      timestamps: true,
    }
  );

  return Unit;
};