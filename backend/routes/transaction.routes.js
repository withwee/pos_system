const router = require("express").Router();
const trx = require("../controllers/transactionController");
const { authenticate } = require("../middlewares/auth");

// Kasir/Admin create transaksi
router.post("/", authenticate, trx.create);

// Lihat semua transaksi
router.get("/", authenticate, trx.getAll);

// Lihat detail transaksi
router.get("/:id", authenticate, trx.getOne);

module.exports = router;
