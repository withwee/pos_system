const { Product, Category, Unit } = require("../models"); // ⬅️ Tambahkan Unit
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
        { sku: { [Op.like]: `%${search}%` } },
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
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: Unit, // ⬅️ TAMBAHAN
          as: "unit",
          attributes: ["id", "name", "symbol", "type"],
        },
      ],
      order: [["name", "ASC"]],
    });

    res.json(products);
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// GET /api/products/:id
exports.getOne = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: Unit, // ⬅️ TAMBAHAN
          as: "unit",
          attributes: ["id", "name", "symbol", "type"],
        },
      ],
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
      unitId, // ⬅️ TAMBAHAN
      image,
    } = req.body;

    // Validasi
    if (!name || !sku || !price || !cost || !categoryId || !unitId) {
      return res.status(400).json({
        message: "Nama, SKU, harga, cost, kategori, dan satuan wajib diisi",
      });
    }

    const product = await Product.create({
      name,
      description,
      sku,
      price,
      cost,
      stock: stock || 0,
      minStock: minStock || 5,
      categoryId,
      unitId, // ⬅️ TAMBAHAN
      image,
    });

    // Fetch with relations
    const productWithDetails = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: "category" },
        { model: Unit, as: "unit" }, // ⬅️ TAMBAHAN
      ],
    });

    res.status(201).json(productWithDetails);
  } catch (err) {
    console.error("Create product error:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "SKU already exists" });
    }

    res.status(500).json({ message: err.message || "Server error" });
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

    // Fetch with relations
    const updatedProduct = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: "category" },
        { model: Unit, as: "unit" }, // ⬅️ TAMBAHAN
      ],
    });

    res.json(updatedProduct);
  } catch (err) {
    console.error("Update product error:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "SKU already exists" });
    }

    res.status(500).json({ message: err.message || "Server error" });
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
    res.status(500).json({ message: err.message || "Server error" });
  }
};
