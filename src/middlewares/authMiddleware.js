const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    // Extract the JWT token from the Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // Check if token is provided
    if (!token) {
        return res
            .status(401)
            .json({ message: "Authorization token is missing" });
    }

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user details from the database based on the decoded user ID
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // Add the user information to req.user
        req.user = user;

        // Call the next middleware or route handler
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;
