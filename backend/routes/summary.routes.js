const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const db = require("../models");

router.get("/", authenticate, async (req, res) => {
  try {
    const totalProducts = await db.Product.count();
    const lowStock = await db.Product.count({ where: { stock: 0 } });
    const totalCategories = await db.Category.count();
    const totalUsers = await db.User.count();
    const totalTransactions = await db.Transaction.count();

    res.json({
      totalProducts,
      lowStock,
      totalCategories,
      totalUsers,
      totalTransactions
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load summary" });
  }
});

module.exports = router;
