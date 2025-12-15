const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      stock: {
        type: DataTypes.DECIMAL(10, 2), // ⬅️ UBAH dari INTEGER ke DECIMAL
        allowNull: false,
        defaultValue: 0,
      },
      minStock: {
        type: DataTypes.DECIMAL(10, 2), // ⬅️ UBAH dari INTEGER ke DECIMAL
        allowNull: false,
        defaultValue: 5,
      },
      unitId: { // ⬅️ TAMBAHAN BARU
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1, // default = pcs
      },
      image: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "products",
      timestamps: true,
    }
  );

  // Associations
  Product.associate = (models) => {
    Product.belongsTo(models.Category, {
      foreignKey: "categoryId",
      as: "category",
    });

    Product.belongsTo(models.Unit, { // ⬅️ TAMBAHAN BARU
      foreignKey: "unitId",
      as: "unit",
    });
  };

  return Product;
};