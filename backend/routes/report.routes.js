const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const report = require("../controllers/reportController");

// Sales report
router.get("/sales", authenticate, report.salesSummary);
router.get("/sales/items", authenticate, report.salesByItem);
router.get("/sales/today", authenticate, report.todaySales);

module.exports = router;
