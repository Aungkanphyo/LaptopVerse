import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express, { Express, NextFunction, Request, Response } from 'express';
import { connectDB } from './config/db.config';
import authRoutes from './routes/auth.routes';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/error.middleware';
import { AppError } from './utils/error.utils';
import productRouter from './routes/product.routes';
import orderRouter from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';
import { globalLimiter } from './middlewares/rateLimiter.middleware';
import guideRoutes from "./routes/guide.routes";
import contactSettingsRoutes from "./routes/contactSettings.routes";
import passport from 'passport';
import './config/passport.config';
import aiRoutes from './routes/ai.routes';

const app: Express = express();

// Security Middleware
app.use(helmet());

// Global Rate Limiting (DDoS Protection)
app.use('/api', globalLimiter);

// CORS Configuration (To connect with React)
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true, // to accept cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

// Body Parsing
// The 10kb limit is in place to safegurad against large data payloads, such as those used in DDoS attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Initialize Passport Middleware
app.use(passport.initialize());

// Test route
app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to LaptopVerse Backend API!');
});

// Auth Route
app.use('/api/v1/auth', authRoutes);

// Product Routes
app.use('/api/v1/products', productRouter);

// Order Routes
app.use('/api/v1/orders', orderRouter);

app.use('/api/v1/payment', paymentRoutes);

app.use('/api/v1/admin', adminRoutes);

app.use("/api/v1/guides", guideRoutes);
app.use("/api/v1/contact-settings", contactSettingsRoutes);

// AI Advisor API Endpoint Registration
app.use("/api/v1/ai", aiRoutes);

// 404 Route Catcher
app.use((req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

const PORT: number = parseInt(process.env.PORT || '5000', 10);

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
        console.log(`⚡️ Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server due to DB connection error.");
        process.exit(1);
    }
}

startServer();

export default app;