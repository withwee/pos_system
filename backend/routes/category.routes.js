const router = require("express").Router();
const category = require("../controllers/categoryController");
const { authenticate } = require("../middlewares/auth");

// Public routes
router.get("/", category.getAll);
router.get("/:id", category.getOne);

// Admin only routes (optional)
router.post("/", authenticate, category.create);
router.put("/:id", authenticate, category.update);
router.delete("/:id", authenticate, category.delete);

module.exports = router;
