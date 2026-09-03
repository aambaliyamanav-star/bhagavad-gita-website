const express = require("express");

const {
  getAllUsers,
  deleteUser
} = require("../controllers/adminController");

const {
  protect,
  adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// Get all users
router.get(
  "/users",
  protect,
  adminOnly,
  getAllUsers
);


// Delete user
router.delete(
  "/users/:id",
  protect,
  adminOnly,
  deleteUser
);


module.exports = router;