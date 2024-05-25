const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const Joi = require("joi");

exports.sendMessage = async (req, res) => {
    const currentUser = req.user;
    try {
        const request = Joi.object({
            recipientIds: Joi.array().items(Joi.string().required()).required(),
            content: Joi.string().required(),
        });

        const { error, value } = request.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { recipientIds, content } = value;

        if (recipientIds.includes(currentUser._id)) {
            return res.status(400).json({
                message: "You cannot send a message to yourself",
            });
        }

        const recipients = await User.find({ _id: { $in: recipientIds } });

        if (!recipients || recipients.length === 0) {
            return res.status(404).json({ message: "Recipients not found" });
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [req.user._id, ...recipientIds] },
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: [req.user._id, ...recipientIds],
            });
            await conversation.save();
        }

        const message = new Message({
            conversation: conversation._id,
            sender: req.user._id,
            content,
        });

        await message.save();

        conversation.messages.push(message._id);
        await conversation.save();

        res.status(201).json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getMessage = async (req, res) => {
    const currentUser = req.user;

    try {
        const message = await Message.findById(req.params.messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (currentUser.role === "admin") {
            return res.json(message);
        }

        const conversation = await Conversation.findById(message.conversation);

        if (
            !conversation ||
            !conversation.participants.includes(currentUser._id)
        ) {
            return res.status(403).json({
                message: "You are not authorized to view this message",
            });
        }

        res.json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateMessage = async (req, res) => {
    const currentUser = req.user;

    try {
        const message = await Message.findById(req.params.messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (message.sender.toString() !== currentUser._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to edit this message",
            });
        }

        const request = Joi.object({
            content: Joi.string().required(),
        });

        const { error, value } = request.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { content } = value;

        const updatedMessage = await Message.findByIdAndUpdate(
            req.params.messageId,
            { content },
            { new: true }
        );

        res.json(updatedMessage);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteMessage = async (req, res) => {
    const currentUser = req.user;

    try {
        const message = await Message.findById(req.params.messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (!message.sender.equals(currentUser._id)) {
            return res.status(403).json({
                message: "You are not authorized to delete this message",
            });
        }

        await Message.findByIdAndDelete(req.params.messageId);
        res.json({ message: "Message deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
