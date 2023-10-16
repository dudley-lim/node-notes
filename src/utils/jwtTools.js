import jwt from "jsonwebtoken";
import BadTokenException from "../exceptions/BadTokenException.js";

const generateToken = ({ email, role, id }) => {
    const options = {
        algorithm: process.env.JWT_ALGO,
        issuer: process.env.JWT_ISSUER,
        subject: email,
        expiresIn: process.env.JWT_EXPIRY,
        audience: role
    };

    return jwt.sign({ userId: id }, process.env.SECRET_KEY, options);
};

const verifyToken = (token, cb) => {
    jwt.verify(token, process.env.SECRET_KEY, cb);
};

const getRoleFromToken = (token) => {
    let role;
    verifyToken(token, (err) => {
        if (err) {
            throw new BadTokenException(err.message);
        } else {
            role = jwt.decode(token)["aud"];
        }
    });

    if (role) {
        return role;
    }
};

const getSubjectFromToken = (token) => {
    let sub;
    verifyToken(token, (err) => {
        if (err) {
            throw new BadTokenException(err.message);
        } else {
            sub = jwt.decode(token)["sub"];
        }
    });

    if (sub) {
        return sub;
    }
};

const getIdFromToken = (token) => {
    let id;
    verifyToken(token, (err) => {
        if (err) {
            throw new BadTokenException(err.message);
        } else {
            id = jwt.decode(token).userId;
        }
    });

    if (id) {
        return id;
    }
};

const parseToken = (token) => {
    const userId = getIdFromToken(token);
    const role = getRoleFromToken(token);
    const subject = getSubjectFromToken(token);

    if (!userId || !role || !subject) {
        throw new BadTokenException("Token is bad");
    }

    return { userId, role, subject };
};

export default {
    generateToken,
    verifyToken,
    getRoleFromToken,
    getSubjectFromToken,
    getIdFromToken,
    parseToken
};