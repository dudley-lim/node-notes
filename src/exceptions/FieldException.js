class FieldException extends Error {
    constructor(message) {
        super(message);
        this.name = "FieldException";
    }
}

export default FieldException;