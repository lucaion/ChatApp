const express = require("express");
const conversationController = require("../controllers/conversationController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.use(authMiddleware);

router.post("/", conversationController.createConversation);
router.get("/:conversationId", conversationController.getConversation);
router.put("/:conversationId", conversationController.updateConversation);
router.delete("/:conversationId", conversationController.deleteConversation);
router.delete(
    "/participant/:conversationId",
    conversationController.deleteParticipant
);

module.exports = router;
