import crypto from 'crypto';
import { ValidationError } from '../../../../packages/error-handler';
import { NextFunction } from 'express';
import redis from '../../../../packages/libs/redis';
import { sendEmail } from './sendEmail';
import { localsName } from 'ejs';


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const validateRegistrationData = (data: any, userType: "user" | "seller") => {
    const { name, email, password, phone_number, country } = data;
    if (!name || !email || !password || (userType === "seller" && !phone_number || !country)) {
        throw new ValidationError("Validation failed", "Missing required fields");
    }

    if (!emailRegex.test(email)) {
        throw new ValidationError("Validation failed", "Invalid email format");
    }






}


export const checkOtpRestrictions = async (email: string, next: NextFunction) => {

    if (await redis.get(`otp_lock:${email}`)) {
        return next(new ValidationError("Validation failed", "Too many OTP requests in a short period try again after 30 minutes"));
    }

    if (await redis.get(`otp_spam_lock:${email}`)) {
        return next(new ValidationError("Validation failed", "Too many OTP requests try again after 2 hours"));
    }

    if (await redis.get(`otp_cooldown:${email}`)) {
        return next(new ValidationError("Validation failed", "Please wait 60 seconds before requesting another OTP"));
    }


}

export const trackOtpRequest = async (email: string, next: NextFunction) => {
    const otpRequestKey = `otp_request_count:${email}`;
    const otpRequests = parseInt(await redis.get(otpRequestKey) || '0');
    if (otpRequests >= 2) {
        await redis.set(`otp_spam_lock:${email}`, 'locked', 'EX', 3600); // 2 hours lock
        return next(new ValidationError("Validation failed", "Too many OTP requests try again after 2 hours"));

    }

    await redis.set(otpRequestKey, (otpRequests + 1).toString(), 'EX', 3600); // Count resets after 1 hour

}

export const sendOtp = async (email: string, name: string, template: string) => {

    const otp = crypto.randomInt(1000, 9999).toString();
    await sendEmail(email, "verify your email", template, { name, otp });
    await redis.set(`otp:${email} `, otp, 'EX', 5 * 60); // OTP valid for 5 minutes
    await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60); // Cooldown of 60 seconds


}