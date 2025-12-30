import { Request, Response, NextFunction } from 'express';
import { checkOtpRestrictions, sendOtp, trackOtpRequest, validateRegistrationData } from '../utils/auth.helper';
import prisma from '../../../../packages/libs/prisma';
import { ValidationError } from '../../../../packages/error-handler';


export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "user");
        const { name, email } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return next(new ValidationError("Validation failed", "Email already in use"));
        }

        await checkOtpRestrictions(email, next);
        await trackOtpRequest(email, next);
        await sendOtp(email, name, "user-activation-email");
        res.status(200).json({ message: "OTP sent to email successfully please check your inbox and verify your account" });


    } catch (error) {
        return next(error);
    }
}
