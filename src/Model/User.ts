import mongoose, { Document, Model, Schema } from "mongoose";

// Type Of Users
export interface IUser extends Document {
    username: string;
    email: string;
    password:string;
    verifyCode:string;
    verifyCodeExpiry:Date;
    isAcceptingMessages:boolean;
    isVerified:boolean;
    messages:IMessage[];
}

export interface IMessage extends Document {
    _id:string
    content: string;
    createdAt: Date;
}   

// Make Message Schema
const MessageSchema: Schema<IMessage> = new Schema({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
});


// Make Schema Of Users
const userSchema: Schema<IUser> = new Schema({
    username:{
        type:String,
        required:[true,"Username is required"],
        unique:true,
        trim:true
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:true,
        trim:true,
        match: [/.+\@.+\..+/, "Invalid Email address"],
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    
    verifyCode:{
        type:String,
        required:[true,"Verify Code is required"]
    },
    verifyCodeExpiry:{
        type:Date,
        required:[true,"Verify Code Expiry is required"]
    },
    isAcceptingMessages:{
        type:Boolean,
        default:true
    },
    isVerified:{
        type:Boolean,
        required:[true,"Verify Code Expiry is required"],
        default:false
    },
    messages:[MessageSchema]
})

// here make interface of model
interface UserModel extends Model<IUser> { };

// Extend Model
const User: UserModel = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model("User", userSchema);
export default User;