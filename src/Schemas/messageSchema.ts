import { z } from "zod";
import { usernameValidation } from "./singUpSchema";

export const messageSchema = z.object({
    username:usernameValidation,
    content: z.string()
    .min(10, { message: "Content must be at least of 10 character" })
    .max(300, {
        message: "Content must be no longer than least of 10 character"
    })
}) 
