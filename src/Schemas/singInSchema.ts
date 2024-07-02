import { z } from "zod";

export const singUpScheama = z.object({
    username:z.string(),
    email: z.string(),
    password: z.string()
}) 