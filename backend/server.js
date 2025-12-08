require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // This must come before routes

// Database connection
const db = require("./models");
db.sequelize.authenticate()
  .then(() => {
    console.log("Database connected");
    return db.sequelize.sync({ alter: true });
  })
  .then(async () => {
    console.log("Database synced");
    await db.createDefaultAdmin();
  })
  .catch((err) => {
    console.log("Database error: " + err);
  });

// Routes
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

const categoryRoutes = require("./routes/category.routes");
app.use("/api/categories", categoryRoutes);

const productRoutes = require("./routes/product.routes");
app.use("/api/products", productRoutes);

const transactionRoutes = require("./routes/transaction.routes");
app.use("/api/transactions", transactionRoutes);

const summaryRoutes = require("./routes/summary.routes");
app.use("/api/summary", summaryRoutes);


// Test route
app.get("/", (req, res) => {
  res.json({ message: "POS Backend Running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
