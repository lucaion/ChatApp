const User = require("../models/User");

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
    const { userId } = req.params;
    const { name, role, password } = req.body;
    const currentUser = req.user; // Assuming you have the current user information stored in req.user
    let isAllowed = false;

    if (currentUser._id.toString() === userId || currentUser.role === "admin") {
        isAllowed = true;
    }

    try {
        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the current user is the same as the user being updated or an admin
        if (!isAllowed) {
            return res.status(403).json({
                message: "You are not authorized to perform this action",
            });
        }

        // Update user name if allowed
        if (name && isAllowed) {
            user.name = name;
        }

        // Update user role if allowed
        if (role && currentUser.role === "admin") {
            user.role = role;
        } else {
            return res.status(403).json({
                message: "You are not authorized to perform this action",
            });
        }

        // Update password if allowed
        if (password && isAllowed) {
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
    try {
        await User.findByIdAndDelete(req.params.userId);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};