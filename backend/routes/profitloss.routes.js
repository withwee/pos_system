const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");

// TEST ROUTE
router.get("/test", authenticate, (req, res) => {
  res.json({ message: "Profit Loss route OK" });
});

module.exports = router;
