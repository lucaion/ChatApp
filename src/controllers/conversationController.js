const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const Joi = require("joi");

exports.createConversation = async (req, res) => {
    const currentUser = req.user;

    try {
        const request = Joi.object({
            participantIds: Joi.array()
                .items(Joi.string().required())
                .required(),
        });

        const { error, value } = request.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { participantIds } = value;

        if (!Array.isArray(participantIds) || participantIds.length < 2) {
            return res.status(400).json({
                message:
                    "At least two participants are required to create a conversation",
            });
        }

        if (!participantIds.includes(currentUser._id.toString())) {
            return res.status(403).json({
                message: "You are not authorized to create this conversation",
            });
        }

        const existingConversation = await Conversation.findOne({
            participants: { $all: participantIds },
            $expr: { $eq: [{ $size: "$participants" }, participantIds.length] },
        });

        if (existingConversation) {
            return res.status(409).json({
                message: "Conversation with these participants already exists",
                existingConversation,
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
    const currentUser = req.user;

    try {
        let query = {};

        if (currentUser.role !== "admin") {
            query = {
                _id: req.params.conversationId,
                participants: currentUser._id,
            };
        } else {
            query = { _id: req.params.conversationId };
        }

        const conversation = await Conversation.findOne(query)
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
    const currentUser = req.user;

    try {
        const conversation = await Conversation.findById(
            req.params.conversationId
        );
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        const isParticipant = conversation.participants.some((participant) =>
            participant.equals(currentUser._id)
        );

        if (!isParticipant) {
            return res.status(403).json({
                message: "You are not a participant of this conversation",
            });
        }

        const request = Joi.object({
            participantId: Joi.string().required(),
        });

        const { error, value } = request.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { participantId } = value;

        const isAlreadyParticipant = conversation.participants.some(
            (participant) => participant.equals(participantId)
        );

        if (isAlreadyParticipant) {
            return res.status(400).json({
                message: "Participant is already in the conversation",
            });
        }

        conversation.participants.push(participantId);
        await conversation.save();

        res.json({ message: "Participant added successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteConversation = async (req, res) => {
    const currentUser = req.user;

    try {
        const conversation = await Conversation.findById(
            req.params.conversationId
        );
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        // Check if the current user is an admin or a participant of the conversation
        if (
            currentUser.role !== "admin" &&
            !conversation.participants.some((participant) =>
                participant.equals(currentUser._id)
            )
        ) {
            return res.status(403).json({
                message: "You are not authorized to delete this conversation",
            });
        }

        await Conversation.findByIdAndDelete(req.params.conversationId);
        await Message.deleteMany({ conversation: req.params.conversationId });
        res.json({ message: "Conversation deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteParticipant = async (req, res) => {
    const currentUser = req.user;

    try {
        const conversation = await Conversation.findById(
            req.params.conversationId
        );

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        const isParticipant = conversation.participants.some((participant) =>
            participant.equals(currentUser._id)
        );

        if (!isParticipant && currentUser.role !== "admin") {
            return res.status(403).json({
                message:
                    "You are not authorized to remove participants from this conversation",
            });
        }

        const request = Joi.object({
            participantId: Joi.string().required(),
        });

        const { error, value } = request.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { participantId } = value;

        const userToBeRemoved = await User.findById(participantId);

        if (!userToBeRemoved) {
            return res
                .status(404)
                .json({ message: "User to be removed not found" });
        }

        const isUserParticipant = conversation.participants.some(
            (participant) => participant.equals(participantId)
        );

        if (!isUserParticipant) {
            return res.status(400).json({
                message: "User is not a participant of this conversation",
            });
        }

        conversation.participants = conversation.participants.filter(
            (participant) => !participant.equals(participantId)
        );

        await conversation.save();

        res.json({ message: "Participant removed successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
