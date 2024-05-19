const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");

exports.createConversation = async (req, res) => {
    const { participantIds } = req.body;

    try {
        if (!Array.isArray(participantIds) || participantIds.length < 2) {
            return res.status(400).json({
                message:
                    "At least two participants are required to create a conversation",
            });
        }

        const participants = await User.find({
            _id: { $in: participantIds },
        });
        if (!participants || participants.length !== participantIds.length) {
            return res
                .status(404)
                .json({ message: "One or more participants not found" });
        }

        const conversation = new Conversation({
            participants: [...participantIds],
        });

        await conversation.save();

        res.status(201).json(conversation);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findById(
            req.params.conversationId
        )
            .populate("participants", "name")
            .populate("messages");
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }
        res.json(conversation);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateConversation = async (req, res) => {
    const { conversationId, participantId } = req.body;
    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        conversation.participants.push(participantId);
        await conversation.save();
        res.json({ message: "Participant added successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteConversation = async (req, res) => {
    try {
        await Conversation.findByIdAndDelete(req.params.conversationId);
        await Message.deleteMany({ conversation: req.params.conversationId });
        res.json({ message: "Conversation deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
