import { AppError } from "./index";
import { Request, Response, NextFunction } from "express";

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        console.log(`Error ${req.method} ${req.url} - ${err.message}`);

        const appError = err as AppError;
        const response: any = {
            status: 'error',
            message: appError.message
        };

        if (appError.details) {
            response.details = appError.details;
        }

        return res.status(appError.statusCode).json(response);
    }
    console.error(`Unexpected Error ${req.method} ${req.url} - ${err.message}`);
    console.error('Error stack:', err.stack);
    return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error'
    });
}