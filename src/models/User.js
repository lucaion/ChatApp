const mongoose = require("mongoose");
const deleteUserMessagesAndConversations = require("../middlewares/userDeletionMiddleware");

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please enter your name"],
        },
        email: {
            type: String,
            unique: true,
            required: [true, "Please enter your email"],
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        password: {
            type: String,
            required: [true, "Please enter your password"],
        },
    },
    {
        timestamps: true,
    }
);

UserSchema.pre("remove", async function (next) {
    try {
        await deleteUserMessagesAndConversations(this);
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
