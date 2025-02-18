import { connect } from "@/lib/dbConfig";
import { User as UserType, getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "../auth/[...nextauth]/option";
import mongoose from "mongoose";
import User from "@/model/User";

export async function GET(request: NextRequest) {
    await connect()
    const session = await getServerSession(authOptions)
    const _user: UserType = session?.user!;
    
    // check session 
    if (!session || !_user) {
        return Response.json(
            { success: false, message: 'Not authenticated' },
            { status: 401 }
        );
    }
    console.log(_user._id);
    
    const useId = new mongoose.Types.ObjectId(_user._id);
    console.log(useId);
    
    try {
        const user = await User.aggregate([
            { $match: { _id: useId } },
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: '$messages' } } },
        ]).exec()
        
        if (!user || user.length === 0) {
            return Response.json(
                { message: 'Message not found', success: false },
                { status: 404 }
            );
        }
        return Response.json(
            { messages: user[0].messages },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return Response.json(
            { message: 'Internal server error', success: false },
            { status: 500 }
        );
    }
}