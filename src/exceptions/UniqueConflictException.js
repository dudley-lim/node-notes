class UniqueConflictException extends Error {
    constructor(message) {
        super(message);
        this.name = "UniqueConflictException";
    }
}

export default UniqueConflictException;