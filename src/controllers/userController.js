import userService from "../services/userService.js";

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const token = await userService.login(email, password);
        res.cookie("token", token, { httpOnly: true });
        res.status(200).json({
            "status": 200,
            "message": "User successfully logged in"
        });
    } catch (err) {
        next(err);
    }
};

const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const token = await userService.register(email, password);
        res.cookie("token", token, { httpOnly: true });
        res.status(201).json({
            "status": 201,
            "message": "User successfully created"
        });
    } catch (err) {
        next(err);
    }
};

const logout = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({
        "status": 200,
        "message": "User successfully logged out"
    });
};

export default {
    login,
    register,
    logout
};