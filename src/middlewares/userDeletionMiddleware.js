// const mongoose = require("mongoose");

// async function deleteUserMessagesAndConversations(user) {
//     try {
//         // Delete user's messages
//         await mongoose.model("Message").deleteMany({ sender: user._id });

//         // Find conversations where the user is a participant along with another user
//         const conversations = await mongoose
//             .model("Conversation")
//             .find({ participants: user._id });
//         for (const conversation of conversations) {
//             if (conversation.participants.length === 2) {
//                 await conversation.remove();
//             }
//         }
//     } catch (error) {
//         throw error;
//     }
// }

// module.exports = deleteUserMessagesAndConversations;
