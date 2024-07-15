import "next-auth";
import { DefaultSession } from "next-auth";

declare module 'next-auth' {
    interface User {
        _id:string;
        username: string;
        email: string;
        isAcceptingMessage: boolean;
        isVerified: boolean;
    }

    interface Session{
        user:User & DefaultSession['user']
    }  
}

// Second way
declare module 'next-auth/jwt'{
    interface JWT{
        _id:string;
        username: string;
        email: string;
        isAcceptingMessage: boolean;
        isVerified: boolean;    
    }
}
