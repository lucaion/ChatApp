const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const errorHandler = require("./src/middlewares/error-handler");
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/user");
const conversationRoutes = require("./src/routes/conversation");
const messageRoutes = require("./src/routes/messages");
const authMiddleware = require("./src/middlewares/authMiddleware");

dotenv.config();

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
// app.use(authMiddleware);
app.use("/user", userRoutes);
app.use("/conversation", conversationRoutes);
app.use("/message", messageRoutes);

app.use(errorHandler);

mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => {
        console.log("Connected to database!");
        app.listen(process.env.PORT, () =>
            console.log(
                `REST API server with env => ${process.env.NODE_ENV} ready at: ${process.env.HOST}:${process.env.PORT}`
            )
        );
    })
    .catch(() => {
        console.log("Connection failed");
    });

module.exports = app;
