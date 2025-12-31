import crypto from 'crypto';
import { ValidationError } from '../../../../packages/error-handler';
import { NextFunction } from 'express';
import redis from '../../../../packages/libs/redis';
import { sendEmail } from './sendEmail';


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const validateRegistrationData = (data: any, userType: "user" | "seller") => {
    const { name, email, password, phone_number, country } = data;
    // For initial registration (OTP sending), only name and email are required
    // Password will be set after OTP verification
    if (!name || !email) {
        throw new ValidationError("Validation failed", "Name and email are required");
    }

    if (userType === "seller" && (!phone_number || !country)) {
        throw new ValidationError("Validation failed", "Phone number and country are required for seller registration");
    }

    if (!emailRegex.test(email)) {
        throw new ValidationError("Validation failed", "Invalid email format");
    }






}


export const checkOtpRestrictions = async (email: string, next: NextFunction): Promise<boolean> => {

    if (await redis.get(`otp_lock:${email}`)) {
        next(new ValidationError("Validation failed", "Too many OTP requests in a short period try again after 30 minutes"));
        return false;
    }

    if (await redis.get(`otp_spam_lock:${email}`)) {
        next(new ValidationError("Validation failed", "Too many OTP requests try again after 2 hours"));
        return false;
    }

    if (await redis.get(`otp_cooldown:${email}`)) {
        next(new ValidationError("Validation failed", "Please wait 60 seconds before requesting another OTP"));
        return false;
    }

    return true;
}

export const trackOtpRequest = async (email: string, next: NextFunction): Promise<boolean> => {
    const otpRequestKey = `otp_request_count:${email}`;
    const otpRequests = parseInt(await redis.get(otpRequestKey) || '0');
    if (otpRequests >= 2) {
        await redis.set(`otp_spam_lock:${email}`, 'locked', 'EX', 3600); // 2 hours lock
        next(new ValidationError("Validation failed", "Too many OTP requests try again after 2 hours"));
        return false;
    }

    await redis.set(otpRequestKey, (otpRequests + 1).toString(), 'EX', 3600); // Count resets after 1 hour
    return true;
}

export const sendOtp = async (email: string, name: string, template: string) => {

    const otp = crypto.randomInt(1000, 9999).toString();
    await sendEmail(email, "verify your email", template, { name, otp });
    await redis.set(`otp:${email}`, otp, 'EX', 5 * 60); // OTP valid for 5 minutes
    await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60); // Cooldown of 60 seconds


}