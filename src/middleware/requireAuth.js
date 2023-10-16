import BadTokenException from "../exceptions/BadTokenException.js";
import UnauthorizedAccessException from "../exceptions/UnauthorizedAccessException.js";
import jwtTools from "../utils/jwtTools.js";

const requireAuth = (req, res, next) => {
    const token = req.cookies.token;

    try {
        if (!token) {
            throw new BadTokenException("Tokenless");
        } else {
            jwtTools.verifyToken(token, (err) => {
                if (err) throw new BadTokenException(err.message);
            });
            next();
        }
    } catch (err) {
        res.clearCookie("token");
        next(err);
    }
};

const requireAuthAdmin = (req, res, next) => {
    console.log("Checking admin token");
    const token = req.cookies.token;

    try {
        if (!token) {
            throw new BadTokenException("Tokenless");
        } else {
            const role = jwtTools.getRoleFromToken(token);
            if (role === "ADMIN") {
                console.log("Admin JWT allowed");
                next();
            } else {
                throw new UnauthorizedAccessException("You do not have access.");
            }
        }
    } catch (err) {
        if (err instanceof BadTokenException) res.clearCookie("token");
        next(err);
    }
};

export default {
    requireAuth,
    requireAuthAdmin
};