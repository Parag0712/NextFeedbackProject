import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/option";
import UserModel from "@/model/User";
import { User } from 'next-auth'
import { connect } from "@/lib/dbConfig";


export async function POST(request: NextRequest, response: NextResponse) {
    await connect()

    const session = await getServerSession(authOptions);

    const user: User = session?.user!;
    if (!session || !session.user) {
        return Response.json(
            { success: false, message: 'Not authenticated' },
            { status: 401 }
        );
    }

    const useId = user._id
    const { acceptMessages } = await request.json();

    try {
        // here accept message
        const updateUser = await UserModel.findByIdAndUpdate(
            useId,
            { isAcceptingMessage: acceptMessages },
            { new: true }
        )

        if (!updateUser) {
            return Response.json(
                {
                    success: false,
                    message: 'Unable to find user to update message acceptance status',
                },
                { status: 404 }
            );
        }
        return Response.json(
            {
                success: true,
                message: 'Message acceptance status updated successfully',
                updateUser,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating message acceptance status:', error);
        return Response.json(
            { success: false, message: 'Error updating message acceptance status' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest, response: NextResponse) {
    await connect()

    // Get the user session
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!session || !user) {
        return Response.json(
            { success: false, message: 'Not authenticated' },
            { status: 401 }
        );
    }
    try {
        const foundUser = await UserModel.findById(user._id);

        if (!foundUser) {
            // User not found
            return Response.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        return Response.json(
            {
                success: true,
                isAcceptingMessages: foundUser.isAcceptingMessage,
            },
            { status: 200 }
        );


    } catch (error) {
        console.error('Error retrieving message acceptance status:', error);
        return Response.json(
            { success: false, message: 'Error retrieving message acceptance status' },
            { status: 500 }
        );
    }
}

