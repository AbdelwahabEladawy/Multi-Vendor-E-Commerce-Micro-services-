
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly details?: any;
    constructor(message: string, statusCode: number, isOperational = true, details?: any) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
        Error.captureStackTrace(this);

    }
}


export class NotFoundError extends AppError {
    constructor(message: "Resource not found") {
        super(message, 404);
    }

}


export class ValidationError extends AppError {
    constructor(message: "Validation failed", details?: any) {
        super(message, 400, true, details);
    }
}


export class AuthError extends AppError {
    constructor(message: "Authentication failed") {
        super(message, 401);
    }
}


export class ForbiddenError extends AppError {
    constructor(message: "Access forbidden") {
        super(message, 403);
    }
}



export class DatabaseError extends AppError {
    constructor(message: "Database error occurred") {
        super(message, 500, false);
    }
}