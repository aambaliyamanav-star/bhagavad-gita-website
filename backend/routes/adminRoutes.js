const express = require("express");

const {
  getAllUsers,
  deleteUser,
  updateUserRole,
  getAdminPermissionsList,
} = require("../controllers/adminController");

const {
  protect,
  adminOnly,
  requirePermission,
  superAdminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get available permissions list metadata
router.get(
  "/permissions",
  protect,
  adminOnly,
  getAdminPermissionsList
);

// Get all users (Protected: requires manage_users permission)
router.get(
  "/users",
  protect,
  requirePermission("manage_users"),
  getAllUsers
);

// Delete user (Protected: requires delete_users permission)
router.delete(
  "/users/:id",
  protect,
  requirePermission("delete_users"),
  deleteUser
);

// Update user role and permissions (Super Admin or manage_admins permission)
router.put(
  "/users/:id/role",
  protect,
  superAdminOnly,
  updateUserRole
);

module.exports = router;