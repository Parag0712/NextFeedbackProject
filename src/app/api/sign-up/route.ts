import { connect } from "@/lib/dbConfig";
import User from "@/model/User";
import bcrypt from 'bcrypt'
import { ApiResponse } from '@/types/ApiResponse'
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { NextResponse } from "next/server";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpiry: Date;
    isAcceptingMessage: boolean;
    isVerified: boolean;
    messages: IMessage[];
}

export interface IMessage extends Document {
    content: string;
    createdAt: Date;
}

export async function POST(request: Request) {
    
    await connect();
    try {
        const body = await request.json();
        const { username, email, password } = body
        const exitingUserVerifiedUsername = await User.findOne({ username, isVerified: true })
        // Check Username exist or not
        if (exitingUserVerifiedUsername) {
            return NextResponse.json({
                success: false,
                messages: "Username is already taken"
            },
                {
                    status: 400
                })
        }

        // Check Email exist or not
        const exitingUserVerifiedByEmail = await User.findOne({ email })
        // Generate Verify Code  
        const verifyCode = Math.floor(100000  + Math.random() * 900000).toString();

        if (exitingUserVerifiedByEmail) {

            if (exitingUserVerifiedByEmail.isVerified) {
                return NextResponse.json({
                    success: false,
                    messages: "Email is already taken"
                },
                    {
                        status: 400
                    })
            } else {
                // If email exit and is not verifed
                const hasedPassword = await bcrypt.hash(password, 10);
                exitingUserVerifiedByEmail.password = hasedPassword;
                exitingUserVerifiedByEmail.verifyCode = verifyCode;
                exitingUserVerifiedByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                await exitingUserVerifiedByEmail.save();
            }
        } else {

            // Generate Hash password
            const hasedPassword = await bcrypt.hash(password, 10,)

            // Here exipery date for otp
            const exipryDate = new Date();
            exipryDate.setHours(exipryDate.getHours() + 1);

            // Here Save User 
            const newUser = new User({
                username,
                password: hasedPassword,
                email,
                verifyCode: verifyCode,
                isVerified: false,
                verifyCodeExpiry: exipryDate,
                isAcceptingMessage: true,
                messages: [],
            });

            await newUser.save();

        }

        // Send Email
        const emailResponse = await sendVerificationEmail(email, username, verifyCode);

        if (!emailResponse.success) {
            return NextResponse.json({
                success: false,
                messages: emailResponse.message
            }, {
                status: 500
            })
        }

        return NextResponse.json({
            success: true,
            messages: "User Register successfully. Please verify your email"
        }, {
            status: 201
        })


    } catch (error) {
        console.error("Error registering user", error);
        const response: ApiResponse = {
            message: "Error registering user",
            success: false
        }
        return Response.json(response,
            {
                status: 500
            }
        )
    }
}