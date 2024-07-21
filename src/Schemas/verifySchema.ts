import {z} from "zod"
import { usernameValidation } from "./singUpSchema"

export const verifySchame = z.object({
    code:z.string().length(6,"Verification Code must be 6 digits"),
})