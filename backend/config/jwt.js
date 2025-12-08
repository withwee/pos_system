require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = {
  generateToken: (user) => {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
  }
};
