import { z } from "zod";


export const usernameValidation = z
    .string()
    .min(2, "Username must be atleast 2 characters")
    .max(20, "Username must be no more then 20 characters")
    .regex(/^[a-zA-Z0-9]+$/, "Username must not contain special characters")


export const emailValidation = z
    .string()
    .email({ message: "Invalid Email address" })


export const passwordValidation = z
    .string()
    .min(6, { message: "password must be at least 6 characters" })


export const singUpScheama = z.object({
    username: usernameValidation,
    email: emailValidation,
    password: passwordValidation
}) 