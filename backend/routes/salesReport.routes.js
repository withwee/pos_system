const express = require("express");
const router = express.Router();

const salesReportController = require("../controllers/salesreportController");

router.get("/summary", salesReportController.summary);
router.get("/daily", salesReportController.daily);
router.get("/by-product", salesReportController.byProduct);

module.exports = router;
