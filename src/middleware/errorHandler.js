import BadTokenException from "../exceptions/BadTokenException.js";
import FieldException from "../exceptions/FieldException.js";
import NotFoundException from "../exceptions/NotFoundException.js";
import UnauthorizedAccessException from "../exceptions/UnauthorizedAccessException.js";
import UniqueConflictException from "../exceptions/UniqueConflictException.js";
import fs from "fs";

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    if (err instanceof FieldException) {
        res.status(400).json({
            "status": 400,
            "message": err.message
        });
    } else if (err instanceof NotFoundException) {
        res.status(404).json({
            "status": 404,
            "message": err.message
        });
    } else if (err instanceof UniqueConflictException) {
        res.status(409).json({
            "status": 409,
            "message": err.message
        });
    } else if (err instanceof UnauthorizedAccessException) {
        res.status(403).json({
            "status": 403,
            "message": err.message
        });
    } else if (err instanceof BadTokenException) {
        res.status(401).json({
            "status": 401,
            "message": err.message
        });
    } else {
        res.status(500).json({
            "status": 500,
            "message": err.message
        });
    }

    logError(err);
};

const errorBuilder = (err) => {
    let errorString = "";
    errorString += "=".repeat(20) + "\r\n";
    errorString += "Error: " + err.name + "\r\n";
    errorString += "Message: " + err.message + "\r\n";
    errorString += "Date: " + new Date() + "\r\n";
    errorString += "=".repeat(20) + "\r\n";

    return errorString;
};

const log = fs.createWriteStream("./errors.log", { flags: "a" });

const logError = (err) => {
    // console.log("Logging error");
    // console.error(err);
    log.write(errorBuilder(err));
};

export default errorHandler;