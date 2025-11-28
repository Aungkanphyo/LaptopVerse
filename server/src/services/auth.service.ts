import User, { IUserDocument } from "../models/user.model";
import { ILoginInput, IRegisterInput } from "../types/auth.types";
import { AppError } from "../utils/error.utils";

export const registerUser = async (data: IRegisterInput): Promise<IUserDocument> => {
    // check for email
    const existingUser = await User.findOne({ email: data.email });
    if(existingUser) {
        // 409 Conflict Error
        throw new AppError('This email is already registered.', 409);
    }

    // User is being created (Password Hashing is already handled by the pre-save hook in user.model.ts)
    const newUser = await User.create({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: 'user', // default role
        isVerified: false,
    });

    return newUser;
};

/**
 * @desc User Login Logic
 * @param data - User login data (email, password)
 * @returns User Document
 */
export const loginUser = async (data: ILoginInput): Promise<IUserDocument> => {
    // Searching for the User. The Password needs to be explicitly selected
    const user = await User.findOne({ email: data.email }).select('+password');

    if(!user || !(await user.comparePassword(data.password))) {
        // 401 Unauthorized Error
        throw new AppError('Invalid email or password.', 401);
    }

    // Login ပြီးမြောက်ပါက Password ကို ဖယ်ပြီး return ပြန်ပေးပါ
    // Mongoose toObject() ကိုသုံးပြီး password ကို ဖယ်ထုတ်နိုင်သည်။
    const userObject = user.toObject();
    delete userObject.password;

    return userObject as IUserDocument;
}