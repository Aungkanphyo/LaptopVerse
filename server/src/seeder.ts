import dotenv from 'dotenv';
import { connectDB } from './config/db.config';
import User from './models/user.model';

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = 'aungkanphyo1920095@gmail.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin account already exists.');
            process.exit();
        }

        await User.create({
            fullName: 'Super Admin',
            email: adminEmail,
            password: 'admin123', // Strong password
            role: 'admin',
            isVerified: true,
        });

        console.log('Admin account created successfully!');
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};
seedAdmin();