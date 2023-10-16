import express from "express";
import userController from "../controllers/userController.js";
import errorHandler from "../middleware/errorHandler.js";

const router = express.Router();

router.post("/login", userController.login);
router.post("/register", userController.register);
router.post("/logout", userController.logout);
router.use(errorHandler);

export default router;