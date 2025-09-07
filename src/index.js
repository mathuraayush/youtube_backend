// import dotenv from 'dotenv';


import 'dotenv/config'
import connectDB from "./db/index.js";
import { app } from './app.js';

// dotenv.config();

connectDB()
.then( () =>{
    app.listen(process.env.PORT || 8080, ()=>{
        console.log(`Server is running at port: ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGO DB Connection Failed!!!", err);
})
 
// function connectDB(){

// }

// connectDB();
//IFE
// (async () => {
//     try {
//        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//     } catch (error) {
//         console.error("ERROR: ", error)
//         throw error
//     }
// })()