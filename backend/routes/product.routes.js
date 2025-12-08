const router = require("express").Router();
const productController = require("../controllers/productController");
const { authenticate, authorize } = require("../middlewares/auth");

// Public
router.get("/", productController.getAll);
router.get("/:id", productController.getOne);

// Admin only
router.post("/", authenticate, authorize(["admin"]), productController.create);
router.put("/:id", authenticate, authorize(["admin"]), productController.update);
router.delete("/:id", authenticate, authorize(["admin"]), productController.remove);

module.exports = router;
