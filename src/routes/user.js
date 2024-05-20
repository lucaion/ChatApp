const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const UserController = require("../controllers/userController");

router.use(authMiddleware); // Protected routes (require authentication)

// Protected routes (require authentication)
router.get("/:userId", UserController.getUser); // Example route that requires authentication
router.put("/:userId", UserController.updateUser);
router.delete("/:userId", authMiddleware, UserController.deleteUser);

module.exports = router;
