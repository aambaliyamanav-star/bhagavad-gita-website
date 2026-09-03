const User = require("../models/User");

// GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      count: users.length,
      users
    });

  } catch (error) {
    res.status(500).json({
      message: "Users મેળવવામાં error આવ્યો.",
      error: error.message
    });
  }
};


// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Admin પોતાને delete કરી શકે નહીં
    if (userId === req.userId.toString()) {
      return res.status(400).json({
        message: "તમે તમારા પોતાના Admin accountને delete કરી શકતા નથી."
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User મળ્યો નથી."
      });
    }

    // બીજા Adminને પણ delete કરી શકાશે નહીં
    if (user.role === "admin") {
      return res.status(403).json({
        message: "બીજા Admin accountને delete કરી શકાતું નથી."
      });
    }

    await User.findByIdAndDelete(userId);

    res.json({
      message: "User successfully deleted. ✅"
    });

  } catch (error) {
    res.status(500).json({
      message: "User delete કરવામાં error આવ્યો.",
      error: error.message
    });
  }
};


module.exports = {
  getAllUsers,
  deleteUser
};