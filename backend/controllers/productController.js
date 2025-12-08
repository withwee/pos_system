const { Product, Category } = require("../models");
const { Op } = require("sequelize");

// GET /api/products
exports.getAll = async (req, res) => {
  try {
    const { search, categoryId, inStock } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } }
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (inStock === "true") {
      where.stock = { [Op.gt]: 0 };
    }

    const products = await Product.findAll({
      where,
      include: [
        {
          model: Category,
          attributes: ["id", "name"]
        }
      ],
      order: [["name", "ASC"]]
    });

    res.json(products);
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/products/:id
exports.getOne = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          attributes: ["id", "name"]
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("Get product error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/products
exports.create = async (req, res) => {
  try {
    const {
      name,
      description,
      sku,
      price,
      cost,
      stock,
      minStock,
      categoryId,
      image
    } = req.body;

    const product = await Product.create({
      name,
      description,
      sku,
      price,
      cost,
      stock,
      minStock,
      categoryId,
      image
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("Create product error:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "SKU already exists" });
    }

    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/products/:id
exports.update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.update(req.body);
    res.json(product);
  } catch (err) {
    console.error("Update product error:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "SKU already exists" });
    }

    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/products/:id
exports.remove = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.destroy();
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
