import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt'
import { connect } from "@/lib/dbConfig";
import User from "@/model/User";

export const authOptions: NextAuthOptions = {
    // Provider
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials: any): Promise<any> {
                await connect();
                try {
                    const user = await User.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier }
                        ],
                    });

                    // Check user exist
                    if (!user) {
                        throw new Error("No user found with this email")
                    }

                    // check user verified or not
                    if (!user.isVerified) {
                        throw new Error("Please verify your account before logging in")
                    }

                    // check password correct or not
                    const isPasswordCorrect = await bcrypt.compare(
                        credentials.password,
                        user.password
                    )

                    // password check 
                    if (isPasswordCorrect) {
                        return user
                    } else {
                        throw new Error('Incorrect password');
                    }
                } catch (error: any) {
                    throw new Error(error);
                }
            }
        }),
    ],
    // pages
    pages: {
        signIn: "/sign-in"
    },

    // callbacks
    callbacks: {
        async session({ session, user, token }) {
            if(token){
                session.user._id = user?._id?.toString()
                session.user.isAcceptingMessage  = user.isAcceptingMessage;
                session.user.isVerified = user.isVerified
                session.user.username = user.username
            }
            return session
        },
        async jwt({ token, user}) {
            if(user){
                token._id = user?._id?.toString()
                token.isAcceptingMessage  = user.isAcceptingMessage;
                token.isVerified = user.isVerified
                token.username = user.username
            }
            return token
        }
    },

    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
    },
}