require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
const db = require("./models");

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database connected");
    
    await db.sequelize.sync({ alter: true }); // ⬅️ Gunakan alter untuk update struktur
    console.log("✅ Database synced");

    await db.createDefaultAdmin();
    await db.seedDefaultUnits(); // ⬅️ TAMBAHAN: Seed default units
  } catch (err) {
    console.error("❌ Database error:", err);
    process.exit(1);
  }
})();

try {
  app.use("/api/auth", require("./routes/auth.routes"));
  app.use("/api/categories", require("./routes/category.routes"));
  app.use("/api/units", require("./routes/unit.routes")); // ⬅️ TAMBAHAN
  app.use("/api/products", require("./routes/product.routes"));
  app.use("/api/transactions", require("./routes/transaction.routes"));
  app.use("/api/reports", require("./routes/report.routes"));
  app.use("/api/profitloss", require("./routes/profitloss.routes"));
  app.use("/api/sales-report", require("./routes/salesReport.routes"));
} catch (err) {
  console.error("❌ Route load error:", err);
  process.exit(1);
}

app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "POS Backend Running",
    time: new Date(),
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({
    message: "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});