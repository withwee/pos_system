const db = require("../models");
const { Transaction, TransactionItem, Product } = db;
const { Op } = require("sequelize");

/**
 * SALES SUMMARY (TOTAL)
 */
exports.summary = async (req, res) => {
  try {
    const totalSales = await Transaction.sum("totalAmount");
    const totalTransactions = await Transaction.count();

    res.json({
      totalSales: totalSales || 0,
      totalTransactions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load sales summary" });
  }
};

/**
 * DAILY SALES
 */
exports.daily = async (req, res) => {
  try {
    const { start, end } = req.query;

    const where = {};
    if (start && end) {
      where.createdAt = {
        [Op.between]: [
          new Date(`${start} 00:00:00`),
          new Date(`${end} 23:59:59`)
        ]
      };
    }

    const transactions = await Transaction.findAll({
      where,
      attributes: ["id", "transactionNumber", "totalAmount", "createdAt"],
      order: [["createdAt", "ASC"]]
    });

    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load daily sales" });
  }
};

/**
 * SALES PER PRODUCT
 */
exports.byProduct = async (req, res) => {
  try {
    const items = await TransactionItem.findAll({
      include: [
        {
          model: Product,
          attributes: ["id", "name", "purchasePrice"]
        }
      ]
    });

    const map = {};

    items.forEach(item => {
      const product = item.Product;
      if (!map[product.id]) {
        map[product.id] = {
          productId: product.id,
          productName: product.name,
          quantity: 0,
          revenue: 0,
          cogs: 0,
          profit: 0
        };
      }

      map[product.id].quantity += item.quantity;
      map[product.id].revenue += Number(item.subtotal);
      map[product.id].cogs += item.quantity * Number(product.purchasePrice);
      map[product.id].profit =
        map[product.id].revenue - map[product.id].cogs;
    });

    res.json(Object.values(map));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load product sales" });
  }
};
