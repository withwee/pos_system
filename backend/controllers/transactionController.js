const { Transaction, TransactionItem, Product, StockLog } = require("../models");
const { Op } = require("sequelize");

function generateTransNumber() {
  return "TRX-" + Date.now();
}

exports.create = async (req, res) => {
  const t = await Transaction.sequelize.transaction();

  try {
    const { items, paymentMethod, customerName } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items required" });
    }

    let total = 0;
    const productCache = {};

    // 🔎 VALIDASI & HITUNG TOTAL
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });

      if (!product) {
        await t.rollback();
        return res.status(400).json({ message: "Product not found" });
      }

      if (product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`
        });
      }

      item.price = product.price;
      item.subtotal = product.price * item.quantity;
      total += item.subtotal;

      productCache[item.productId] = product;
    }

    // 🧾 CREATE TRANSACTION
    const transaction = await Transaction.create({
      transactionNumber: generateTransNumber(),
      totalAmount: total,
      paymentMethod,
      customerName,
      userId: req.user.id
    }, { transaction: t });

    // 📦 CREATE ITEMS + UPDATE STOCK + LOG STOCK
    for (const item of items) {
      const product = productCache[item.productId];

      const beforeStock = product.stock;
      const afterStock = beforeStock - item.quantity;

      // transaction item
      await TransactionItem.create({
        transactionId: transaction.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      }, { transaction: t });

      // update product stock
      await product.update(
        { stock: afterStock },
        { transaction: t }
      );

      // 📊 STOCK LOG (INI YANG PENTING)
      await StockLog.create({
        productId: product.id,
        type: "OUT",
        quantity: item.quantity,
        beforeStock,
        afterStock,
        source: "SALE",
        userId: req.user.id,
        note: `Transaction ${transaction.transactionNumber}`
      }, { transaction: t });
    }

    await t.commit();

    res.status(201).json({
      message: "Transaction created",
      transactionId: transaction.id,
      transactionNumber: transaction.transactionNumber
    });

  } catch (err) {
    await t.rollback();
    console.error("Transaction error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAll = async (req, res) => {
  const transactions = await Transaction.findAll({
    include: [
      {
        model: TransactionItem,
        include: [{ model: Product }]
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  res.json(transactions);
};

exports.getOne = async (req, res) => {
  const trx = await Transaction.findByPk(req.params.id, {
    include: [
      {
        model: TransactionItem,
        include: [Product]
      }
    ]
  });

  if (!trx) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  res.json(trx);
};
