const { Unit } = require("../models");

exports.getAll = async (req, res) => {
  try {
    const units = await Unit.findAll({
      order: [["name", "ASC"]],
    });

    res.json({
      success: true,
      data: units,
    });
  } catch (error) {
    console.error("Error fetching units:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data satuan",
    });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await Unit.findByPk(id);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Satuan tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: unit,
    });
  } catch (error) {
    console.error("Error fetching unit:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data satuan",
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, symbol, type } = req.body;

    if (!name || !symbol || !type) {
      return res.status(400).json({
        success: false,
        message: "Nama, simbol, dan tipe satuan wajib diisi",
      });
    }

    const unit = await Unit.create({
      name,
      symbol,
      type,
    });

    res.status(201).json({
      success: true,
      data: unit,
      message: "Satuan berhasil ditambahkan",
    });
  } catch (error) {
    console.error("Error creating unit:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Nama satuan sudah digunakan",
      });
    }

    res.status(500).json({
      success: false,
      message: "Gagal menambahkan satuan",
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, symbol, type } = req.body;

    const unit = await Unit.findByPk(id);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Satuan tidak ditemukan",
      });
    }

    await unit.update({
      name: name || unit.name,
      symbol: symbol || unit.symbol,
      type: type || unit.type,
    });

    res.json({
      success: true,
      data: unit,
      message: "Satuan berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error updating unit:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui satuan",
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const unit = await Unit.findByPk(id);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Satuan tidak ditemukan",
      });
    }

    // Cek apakah ada produk yang menggunakan unit ini
    const { Product } = require("../models");
    const productCount = await Product.count({
      where: { unitId: id },
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Tidak dapat menghapus satuan karena masih digunakan oleh ${productCount} produk`,
      });
    }

    await unit.destroy();

    res.json({
      success: true,
      message: "Satuan berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting unit:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus satuan",
    });
  }
};