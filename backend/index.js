import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoute from './Routers/auth.js';
import userRoute from './Routers/user.js';
import doctorRoute from './Routers/doctor.js';
import bookingRoute from './Routers/booking.js';
import contactRoute from './Routers/contact.js';
import notificationRoute from './Routers/notification.js';
import adminRoute from './Routers/admin.js';
import statsRoute from './Routers/stats.js';
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
    origin: true,
}

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many attempts, please try again later' },
});

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

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1/auth', authLimiter, authRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/doctors', doctorRoute);
app.use('/api/v1/bookings', bookingRoute);
app.use('/api/v1/contact', contactRoute);
app.use('/api/v1/notifications', notificationRoute);
app.use('/api/v1/admin', adminRoute);
app.use('/api/v1/stats', statsRoute);

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
});

app.listen(port, () => {
    connectDB();
    console.log("Server is running on port " + port);
})
