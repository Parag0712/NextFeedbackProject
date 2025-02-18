import { verifySchame } from "@/Schemas/verifySchema";
import { connect } from "@/lib/dbConfig";
import User from "@/model/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, response: NextResponse) {
    await connect()
    try {
        const { username, code } = await request.json();
        const decodedUsername = decodeURIComponent(username)
      
        // check user if exist or not
        const user = await User.findOne({
            username: decodedUsername
        })

        // check user exist or not
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' }, {
                status: 404
            })
        }

        // Check if the code is correct and not expired
        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true
            await user.save()
            return NextResponse.json({ success: true, message: 'Account verified successfully' }, {
                status: 200
            })
        } else if (!isCodeNotExpired) {
            return Response.json(
                {
                    success: false,
                    message:
                        'Verification code has expired. Please sign up again to get a new code.',
                },
                { status: 400 }
            );
        } else {
            return Response.json(
                { success: false, message: 'Incorrect verification code' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('Error verifying user:', error);
        return Response.json(
            { success: false, message: 'Error verifying user' },
            { status: 500 }
        );
    }
}