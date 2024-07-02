import { z } from "zod";

export const acceptingMessageSchema = z.object({
    acceptingMessage:z.boolean(),
}) 