import { z } from "zod";

export const singInScheama = z.object({
    identifier: z.string(),
    password: z.string(),
}) 