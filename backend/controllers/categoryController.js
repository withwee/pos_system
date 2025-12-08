const { Category } = require("../models");

exports.getAll = async (req, res) => {
  const categories = await Category.findAll({ order: [["name", "ASC"]] });
  res.json(categories);
};

exports.getOne = async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });
  res.json(category);
};

exports.create = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: "Category already exists" });
  }
};

exports.update = async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });

  await category.update(req.body);
  res.json(category);
};

exports.delete = async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });

  await category.destroy();
  res.json({ message: "Category deleted" });
};
