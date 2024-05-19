const logger = require("../utils/logger.js");

const errorHandler = (err, req, res, next) => {
    logger.error(err);

    const statusCode = err.statusCode || 500;
    const message = err.errorMessage || "Internal Server Error";

    const error = {
        statusCode,
        message,
    };

    if (
        err.stack &&
        process.env.NODE_ENV === "development" &&
        !err.errorMessage
    ) {
        error.stack = err.stack;
    }

    return res.status(statusCode).json(error);
};

module.exports = errorHandler;
