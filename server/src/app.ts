import express, { Express, Request, Response } from 'express';
import { connectDB } from './config/db.config';

const app: Express = express();

// Middleware
// JWT/Cookie Auth အတွက်
app.use(express.json()); // Request body ကို JSON အဖြစ် parse လုပ်ရန်

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to LaptopVerse Backend API!');
});

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