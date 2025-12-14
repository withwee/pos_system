const { Transaction, TransactionItem, Product, sequelize } = require("../models");
const { Op, fn, col, literal } = require("sequelize");

exports.summary = async (req, res) => {
  try {
    const { start, end } = req.query;

    const trxWhere = {};
    if (start && end) {
      trxWhere.createdAt = {
        [Op.between]: [
          new Date(`${start} 00:00:00`),
          new Date(`${end} 23:59:59`)
        ]
      };
    }

    // Revenue
    const revenueResult = await Transaction.findOne({
      attributes: [[fn("SUM", col("totalAmount")), "revenue"]],
      where: trxWhere,
      raw: true
    });

    // COGS (JOIN MANUAL)
    const cogsResult = await TransactionItem.findOne({
      attributes: [
        [
          fn(
            "SUM",
            literal("transaction_items.quantity * products.purchasePrice")
          ),
          "cogs"
        ]
      ],
      include: [
        {
          model: Product,
          attributes: []
        },
        {
          model: Transaction,
          attributes: [],
          where: trxWhere
        }
      ],
      raw: true
    });

    const revenue = Number(revenueResult?.revenue || 0);
    const cogs = Number(cogsResult?.cogs || 0);

    res.json({
      revenue,
      cogs,
      grossProfit: revenue - cogs
    });

  } catch (err) {
    console.error("Profit loss summary error:", err);
    res.status(500).json({ message: "Failed to load profit loss summary" });
  }
};

exports.monthly = async (req, res) => {
  try {
    const data = await TransactionItem.findAll({
      attributes: [
        [fn("DATE_FORMAT", col("Transaction.createdAt"), "%Y-%m"), "month"],
        [fn("SUM", col("TransactionItem.subtotal")), "revenue"],
        [
          fn(
            "SUM",
            literal("TransactionItem.quantity * Product.purchasePrice")
          ),
          "cogs"
        ]
      ],
      include: [
        { model: Product, attributes: [] },
        { model: Transaction, attributes: [] }
      ],
      group: [literal("month")],
      order: [[literal("month"), "ASC"]],
      raw: true
    });

    res.json(
      data.map(row => ({
        month: row.month,
        revenue: Number(row.revenue),
        cogs: Number(row.cogs),
        profit: Number(row.revenue) - Number(row.cogs)
      }))
    );

  } catch (err) {
    console.error("Monthly profit error:", err);
    res.status(500).json({ message: "Failed to load monthly profit" });
  }
};

const { TransactionItem, Product, Transaction } = require("../models");
const { Op, fn, col, literal } = require("sequelize");

exports.productProfit = async (req, res) => {
  try {
    const { start, end, limit = 5, type = "top" } = req.query;

    const trxWhere = {};
    if (start && end) {
      trxWhere.createdAt = {
        [Op.between]: [
          new Date(`${start} 00:00:00`),
          new Date(`${end} 23:59:59`)
        ]
      };
    }

    const data = await TransactionItem.findAll({
      attributes: [
        [col("Product.id"), "productId"],
        [col("Product.name"), "productName"],
        [fn("SUM", col("TransactionItem.subtotal")), "revenue"],
        [
          fn(
            "SUM",
            literal("TransactionItem.quantity * Product.purchasePrice")
          ),
          "cogs"
        ]
      ],
      include: [
        {
          model: Product,
          attributes: []
        },
        {
          model: Transaction,
          attributes: [],
          where: trxWhere
        }
      ],
      group: ["Product.id"],
      order: [
        [
          literal(
            "(SUM(TransactionItem.subtotal) - SUM(TransactionItem.quantity * Product.purchasePrice))"
          ),
          type === "bottom" ? "ASC" : "DESC"
        ]
      ],
      limit: Number(limit),
      raw: true
    });

    const result = data.map(row => {
      const revenue = Number(row.revenue);
      const cogs = Number(row.cogs);

      return {
        productId: row.productId,
        productName: row.productName,
        revenue,
        cogs,
        profit: revenue - cogs
      };
    });

    res.json(result);

  } catch (err) {
    console.error("Product profit error:", err);
    res.status(500).json({ message: "Failed to load product profit" });
  }
};
