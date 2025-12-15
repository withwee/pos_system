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

router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    
    res.json({
      success: true,
      data: categories  // ⬅️ Pastikan wrapped dalam "data"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
