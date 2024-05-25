const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Joi = require("joi");

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    const currentUser = req.user;

    try {
        // Find the user by userId
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the current user is the same as the user being updated or an admin
        if (
            currentUser._id.toString() !== req.params.userId &&
            currentUser.role !== "admin"
        ) {
            return res.status(403).json({
                message: "You are not authorized to perform this action",
            });
        }

        const request = Joi.object({
            name: Joi.string(),
            role: Joi.string(),
            password: Joi.string().min(8),
        });

        const { error, value } = request.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { name, role, password } = value;

        // Update user name if allowed
        if (name) {
            user.name = name;
        }

        // Update user role if allowed
        if (role && currentUser.role === "admin") {
            user.role = role;
        }

        // Update password if allowed
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        await user.save();

        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    const { userId } = req.params;
    const currentUser = req.user;
    try {
        if (
            currentUser.role !== "admin" &&
            currentUser._id.toString() !== userId
        ) {
            return res.status(403).json({
                message: "You are not authorized to perform this action",
            });
        }
        // Delete user's messages
        await Message.deleteMany({ sender: userId });

        // Find conversations where the user is a participant along with another user
        const conversations = await Conversation.find({
            participants: userId,
        });

        for (const conversation of conversations) {
            if (conversation.participants.length === 2) {
                await conversation.deleteOne();
            } else {
                conversation.participants.pull(userId);
                await conversation.save();
            }
        }

        await User.findByIdAndDelete(req.params.userId);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
