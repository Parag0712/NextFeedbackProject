import { usernameValidation } from "@/Schemas/singUpSchema";
import { connect } from "@/lib/dbConfig";
import User from "@/model/User";
import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod'

// check username
const UsernameQuerySchema = z.object({
    username: usernameValidation,
});

export async function GET(request: NextRequest, response: NextResponse) {
    await connect()
    // localhost:3000/api/check-username?username=parag 
    try {
        // get url
        const { searchParams } = new URL(request.url);
        const queryParams = {
            username: searchParams.get('username'),
        };

        // validate with zod    
        const result = UsernameQuerySchema.safeParse(queryParams);
        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [];
            console.log(result.error.format());

            return NextResponse.json({
                success: false,
                message: usernameErrors.length > 0 ? usernameErrors.join(', ') : "Invalid query parameters"
            },
                {
                    status: 400
                })
        }
        
        const { username } = result.data

        // check use verify or not
        const existingVerifiedUser = await User.findOne({
            username: username,
            isVerified: true
        })

        if (existingVerifiedUser) {
            return NextResponse.json({
                success: false,
                message: "Username is already taken"
            },
                {
                    status: 200
                }
            )
        }


        return NextResponse.json({
            success: true,
            message: "Username is unique"
        },
            {
                status: 200
            })



        return NextResponse.json({})



    } catch (error) {
        console.error("Error checking username ", error);
        return NextResponse.json({
            success: false,
            message: "Error cheking username"
        },
            {
                status: 500
            }
        )

    }
}

