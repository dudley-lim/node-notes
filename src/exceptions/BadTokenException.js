class BadTokenException extends Error {
    constructor(message) {
        super(message);
        this.name = "BadTokenException";
    }
}

export default BadTokenException;