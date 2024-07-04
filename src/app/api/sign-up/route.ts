import { connect } from "@/lib/dbConfig";
import User from "@/model/User";
import bcrypt from 'bcrypt'
import { ApiResponse } from '@/types/ApiResponse'
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
    await connect();

    try {
        const {username,email,password} = await request.json();
    } catch (error) {
        console.error("Error registering user", error);
        const response: ApiResponse = {
            message: "Error registering user",
            success: false
        }
        return Response.json(response,
            {
                status:500
            }
        )
    }
}