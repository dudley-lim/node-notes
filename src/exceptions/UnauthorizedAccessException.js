class UnauthorizedAccessException extends Error {
    constructor(message) {
        super(message);
        this.name = "UnauthorizedAccessException";
    }
}

export default UnauthorizedAccessException;