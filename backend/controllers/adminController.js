const User = require("../models/User");
const Visitor = require("../models/Visitor");

// GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // Calculate visit counts for each registered user after registration
    const visitAgg = await Visitor.aggregate([
      {
        $match: {
          isRegistered: true,
          userId: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$userId",
          visitCount: { $sum: 1 },
        },
      },
    ]);

    const visitMap = {};
    visitAgg.forEach((item) => {
      if (item._id) {
        visitMap[String(item._id)] = item.visitCount;
      }
    });

    const usersWithVisits = users.map((user) => ({
      ...user,
      visitCount: visitMap[String(user._id)] || 0,
    }));

    res.json({
      count: usersWithVisits.length,
      users: usersWithVisits,
    });
  } catch (error) {
    res.status(500).json({
      message: "Users મેળવવામાં error આવ્યો.",
      error: error.message,
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