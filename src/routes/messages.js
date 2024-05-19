const express = require("express");
const messageController = require("../controllers/messageController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware); // Protected routes (require authentication)

router.post("/", messageController.sendMessage);
router.get("/:messageId", messageController.getMessage);
router.put("/:messageId", messageController.updateMessage);
router.delete("/:messageId", messageController.deleteMessage);

module.exports = router;
