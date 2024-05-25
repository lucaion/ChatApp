const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const UserController = require("../controllers/userController");

router.use(authMiddleware); // Protected routes (require authentication)

// Protected routes (require authentication)
router.get("/user/:userId", UserController.getUser); // Example route that requires authentication
router.put("/user/:userId", UserController.updateUser);
router.delete("/user/:userId", UserController.deleteUser);
router.get("/users", UserController.getAllUsers);

module.exports = router;
