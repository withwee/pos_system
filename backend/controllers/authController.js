const { User } = require("../models");
const { generateToken } = require("../config/jwt");

exports.login = async (req, res) => {
  try {
    // Check if request body exists and has required fields
    if (!req.body || !req.body.email || !req.body.password) {
      return res.status(400).json({ 
        message: "Email and password are required" 
      });
    }

    const { email, password } = req.body;

    // Cari user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Cocokkan password
    const isValid = await user.validPassword(password);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Buat token
    const token = generateToken(user);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};