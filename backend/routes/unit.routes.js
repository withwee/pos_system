const router = require("express").Router();
const unitController = require("../controllers/unitController");
const { authenticate, authorize } = require("../middlewares/auth");

// Public - semua bisa lihat units
router.get("/", unitController.getAll);
router.get("/:id", unitController.getOne);

// Admin only - manage units
router.post("/", authenticate, authorize(["admin"]), unitController.create);
router.put("/:id", authenticate, authorize(["admin"]), unitController.update);
router.delete("/:id", authenticate, authorize(["admin"]), unitController.remove);

module.exports = router;