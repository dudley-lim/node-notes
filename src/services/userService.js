import jwtTools from "../utils/jwtTools.js";
import pool from "../utils/conn.js";
import validator from "validator";
import bcrypt from "bcrypt";
import FieldException from "../exceptions/FieldException.js";
import NotFoundException from "../exceptions/NotFoundException.js";
import UniqueConflictException from "../exceptions/UniqueConflictException.js";

const login = async (email, password) => {
    // validate fields (missing fields)
    if (!email || !password) {
        throw new FieldException("Required field(s) have missing values");
    }

    // check for existing user
    const [[user]] = await pool.execute(`
        SELECT * FROM users
        WHERE email = ?
    `, [email]);

    if (!user) {
        throw new NotFoundException("Email does not exist");
    }

    // compare passwords
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        throw new FieldException("Wrong password");
    }

    // generate/send token
    try {
        const token = jwtTools.generateToken({ email: user.email, role: user.role, id: user.user_id });
        return token;
    } catch (err) {
        throw new Error(err.message);
    }
};

const register = async (email, password) => {
    // validate fields (missing fields, proper email format, strong password)
    if (!email || !password) {
        throw new FieldException("Required field(s) have missing values");
    }

    if (!validator.isEmail(email)) {
        throw new FieldException("Input must be an email");
    }

    if (!validator.isStrongPassword(password)) {
        throw new FieldException("Password not strong enough");
    }

    // check for existing user
    const [[user]] = await pool.execute(`
        SELECT * FROM users
        WHERE email = ?
    `, [email]);

    if (user) {
        throw new UniqueConflictException("Email already taken");
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // create user and generate/send token
    try {
        const result = await pool.execute(`
            INSERT users (email, password, role)
            VALUES (?, ?, "USER")
        `, [email, hash]);

        const token = jwtTools.generateToken({ email, role: "USER", id: result[0].insertId });
        return token;
    } catch (err) {
        throw new Error(err.message);
    }
};

export default {
    login,
    register
};