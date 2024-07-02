import mongoose from 'mongoose';


type ConnectionObject = {
    isConnected?:number
}
const connection:ConnectionObject={}

export async function connect():Promise<void>{
    if(connection.isConnected){
        console.log("Already connected to database");
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGO_URI! || '',{});
        connection.isConnected = db.connections[0].readyState
        console.log("Db Connected Succefully");
        
    } catch (error) {
        console.log('Something goes wrong!');
        console.log(error);
        process.exit(1);
    }
}

export default connect();