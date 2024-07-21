import { messageSchema } from "@/Schemas/messageSchema";
import { connect } from "@/lib/dbConfig";
import User, { IMessage } from "@/model/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, response: NextResponse) {

    await connect()
    const { username, content } = await request.json()
    const result = messageSchema.safeParse({
        username,
        content
    })

    // validation 
    if (!result.success) {
        const formattedErrors = result.error.format();

        // Check for username and verification code errors
        const contentErrors = formattedErrors.content?._errors || [];

        let errorMessage = '';
        if (contentErrors.length > 0) {
            errorMessage += `Verification code errors: ${contentErrors.join(', ')}. `;
        }
        if (errorMessage === '') {
            errorMessage = 'Invalid query parameters';
        }

        return NextResponse.json({
            success: false,
            message: errorMessage.trim()
        }, {
            status: 400
        });
    }

    try {
        const user = await User.findOne({
            username
        }).exec()

        if (!user) {
            return Response.json(
                { message: 'User not found', success: false },
                { status: 404 }
            );
        }

        // Check if the user is accepting messages
        if (!user.isAcceptingMessages) {
            return Response.json(
                { message: 'User is not accepting messages', success: false },
                { status: 403 } // 403 Forbidden status
            );
        }
        const newMessage = { content, createdAt: new Date() };

        user.messages.push(newMessage as IMessage);
        await user.save();
        return Response.json(
            { message: 'Message sent successfully', success: true },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error adding message:', error);
        return Response.json(
            { message: 'Internal server error', success: false },
            { status: 500 }
        );

    }
}