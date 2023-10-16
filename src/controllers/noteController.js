import noteService from "../services/noteService.js";

const getNotes = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        const notes = await noteService.getNotes(token);
        res.status(200).json({
            "status": 200,
            "data": notes
        });
    } catch (err) {
        next(err);
    }
};

const getNote = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        const id = req.params.id;
        const note = await noteService.getNote(token, id);
        res.status(200).json({
            "status": 200,
            "data": note
        });
    } catch (err) {
        next(err);
    }
};

const createNote = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        const { title, content } = req.body;
        const note = await noteService.createNote(token, title, content);
        res.status(201).json({
            "status": 201,
            "message": "Note successfully created",
            "data": note
        });
    } catch (err) {
        next(err);
    }
};

const updateNote = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        const id = req.params.id;
        const { title, content } = req.body;
        const note = await noteService.updateNote(token, id, title, content);
        res.status(200).json({
            "status": 200,
            "message": "Note successfully updated",
            "data": note
        });
    } catch (err) {
        next(err);
    }
};

const deleteNote = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        const id = req.params.id;
        const note = await noteService.deleteNote(token, id);
        res.status(200).json({
            "status": 200,
            "message": "Note successfully deleted",
            "data": note
        });
    } catch (err) {
        next(err);
    }
};

export default {
    getNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote
};