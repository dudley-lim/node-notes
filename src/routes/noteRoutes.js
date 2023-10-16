import express from "express";
import noteController from "../controllers/noteController.js";
import requireAuth from "../middleware/requireAuth.js";
import errorHandler from "../middleware/errorHandler.js";
import noteBodyChecker from "../middleware/noteBodyChecker.js";

const router = express.Router();

router.use(requireAuth.requireAuth);
router.get("", noteController.getNotes);
router.get("/:id", noteController.getNote);
router.post("", noteBodyChecker, noteController.createNote);
router.put("/:id", noteBodyChecker, noteController.updateNote);
router.delete("/:id", noteController.deleteNote);
router.use(errorHandler);

export default router;