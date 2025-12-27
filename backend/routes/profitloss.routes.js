const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const profitLossController = require("../controllers/profitlossController");

router.get("/summary", authenticate, profitLossController.summary);
router.get("/monthly", authenticate, profitLossController.monthly);
router.get("/products", authenticate, profitLossController.productProfit);

module.exports = router;
