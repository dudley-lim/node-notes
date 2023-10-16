import FieldException from "../exceptions/FieldException.js";

const noteBodyChecker = (req, res, next) => {
    try {
        const { title, content } = req.body;

        if (!title || !title.trim()) {
            throw new FieldException("Title is required");
        }

        req.body.title = title.trim();
        req.body.content = content.trim();

        next();
    } catch (err) {
        next(err);
    }
};

export default noteBodyChecker;