import jwtTools from "../utils/jwtTools.js";
import pool from "../utils/conn.js";
import NotFoundException from "../exceptions/NotFoundException.js";
import UnauthorizedAccessException from "../exceptions/UnauthorizedAccessException.js";

// 1 query
const getNotes = async (token) => {
    const { userId, role } = jwtTools.parseToken(token);

    const query = `SELECT * FROM notes`;
    let [notes] = await attemptQuery(query, []);

    if (role != "ADMIN") {
        notes = notes.filter((row) => {
            return row.author_id == userId;
        });
    }

    return notes;
};

// 1 query
const getNote = async (token, id) => {
    const { userId, role } = jwtTools.parseToken(token);

    const query = `SELECT * FROM notes WHERE note_id = ?`;
    let [[note]] = await attemptQuery(query, [id]);
    
    if (!note) {
        throw new NotFoundException("Note not found");
    }

    if (note.author_id != userId && role != "ADMIN") {
        throw new UnauthorizedAccessException("You do not have access to this note");
    }

    return note;
};

// 2 queries
const createNote = async (token, title, content) => {
    const { userId } = jwtTools.parseToken(token);

    let query = `INSERT notes (title, content, author_id) VALUES (?, ?, ?)`;
    let result = await attemptQuery(query, [title, content, userId]);

    let note = await getNote(token, result[0].insertId);

    return note;
};

// 3 queries
const updateNote = async (token, id, title, content) => {
    const { userId, role } = jwtTools.parseToken(token);

    checkOwnership(await getNote(token, id), userId, role);

    let query = `UPDATE notes SET title = IFNULL(?, title), content = IFNULL(?, content) WHERE note_id = ?`;
    await attemptQuery(query, [title, content, id]);
    
    let note = await getNote(token, id);
    return note;
};

// 2 queries
const deleteNote = async (token, id) => {
    const { userId, role } = jwtTools.parseToken(token);

    let note = await getNote(token, id);
    checkOwnership(note, userId, role);

    let query = `DELETE FROM notes WHERE note_id = ?`;
    await attemptQuery(query, [id]);

    return note;
};

// helper fxns
const attemptQuery = async (query, data) => {
    try {
        const result = await pool.execute(query, [...data]);
        return result;
    } catch (err) {
        throw new Error(err.message);
    }
};

const checkOwnership = (result, userId, role) => {
    if (role != "ADMIN" && (userId && result.author_id != userId)) {
        throw new UnauthorizedAccessException("You are not the owner of this note");
    }

    return result;
};

export default {
	getNotes,
	getNote,
    createNote,
    updateNote,
    deleteNote
};