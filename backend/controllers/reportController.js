const { Transaction, TransactionItem, Product } = require("../models");
const { Op, fn, col, literal } = require("sequelize");

/**
 * SALES SUMMARY
 * /api/reports/sales?type=daily|monthly
 */
exports.salesSummary = async (req, res) => {
  try {
    const { type = "daily" } = req.query;

    let groupFormat;
    if (type === "monthly") {
      groupFormat = fn("DATE_FORMAT", col("createdAt"), "%Y-%m");
    } else {
      groupFormat = fn("DATE", col("createdAt"));
    }

    const data = await Transaction.findAll({
      attributes: [
        [groupFormat, "period"],
        [fn("SUM", col("totalAmount")), "totalSales"],
        [fn("COUNT", col("id")), "totalTransactions"]
      ],
      group: ["period"],
      order: [[literal("period"), "ASC"]]
    });

    res.json(data);
  } catch (err) {
    console.error("Sales summary error:", err);
    res.status(500).json({ message: "Failed to load sales summary" });
  }
};

/**
 * ITEM WISE SALES
 * /api/reports/sales/items
 */
exports.salesByItem = async (req, res) => {
  try {
    const items = await TransactionItem.findAll({
      attributes: [
        "productId",
        [fn("SUM", col("quantity")), "totalSold"],
        [fn("SUM", col("subtotal")), "totalRevenue"]
      ],
      include: [
        {
          model: Product,
          attributes: ["name", "category"]
        }
      ],
      group: ["productId"],
      order: [[fn("SUM", col("subtotal")), "DESC"]]
    });

    res.json(items);
  } catch (err) {
    console.error("Item sales error:", err);
    res.status(500).json({ message: "Failed to load item sales" });
  }
};

/**
 * TODAY SALES (dashboard)
 * /api/reports/sales/today
 */
exports.todaySales = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const result = await Transaction.findOne({
      attributes: [
        [fn("SUM", col("totalAmount")), "totalSales"],
        [fn("COUNT", col("id")), "totalTransactions"]
      ],
      where: {
        createdAt: { [Op.between]: [start, end] }
      }
    });

    res.json({
      totalSales: Number(result?.dataValues?.totalSales || 0),
      totalTransactions: Number(result?.dataValues?.totalTransactions || 0)
    });
  } catch (err) {
    console.error("Today sales error:", err);
    res.status(500).json({ message: "Failed to load today sales" });
  }

exports.salesByItem = async (req, res) => {
  try {
    const data = await TransactionItem.findAll({
      attributes: [
        "productId",
        [fn("SUM", col("quantity")), "qtySold"],
        [fn("SUM", col("subtotal")), "revenue"]
      ],
      include: [
        {
          model: Product,
          attributes: ["name", "category"]
        }
      ],
      group: ["productId"],
      order: [[fn("SUM", col("subtotal")), "DESC"]]
    });

    res.json(data);
  } catch (err) {
    console.error("Item sales error:", err);
    res.status(500).json({ message: "Failed to load item sales" });
  }
};

exports.todaySales = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const result = await Transaction.findOne({
      attributes: [
        [fn("SUM", col("totalAmount")), "totalSales"],
        [fn("COUNT", col("id")), "totalTransactions"]
      ],
      where: {
        createdAt: {
          [Op.between]: [start, end]
        }
      }
    });

    res.json({
      totalSales: Number(result?.dataValues?.totalSales || 0),
      totalTransactions: Number(result?.dataValues?.totalTransactions || 0)
    });
  } catch (err) {
    console.error("Today sales error:", err);
    res.status(500).json({ message: "Failed to load today sales" });
  }
};

};
