import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoute from './Routers/auth.js';  
import userRoute from './Routers/user.js';
import doctorRoute from './Routers/doctor.js';
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
    origin: true,
}
app.get('/', (req, res) => {
    res.send('API is running...');
})
mongoose.set('strictQuery', false);
const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log('MongoDB connected');   
    }catch(err){
        console.error('MongoDB connection failed',err.message);
    }
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/doctors', doctorRoute);

app.listen(port, () => {
    connectDB();
    console.log("Server is running on port " + port);
})