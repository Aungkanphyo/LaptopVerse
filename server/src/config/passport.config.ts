import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import User from "../models/user.model";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback';

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
                callbackURL: GOOGLE_CALLBACK_URL,
            },
            async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
                try {
                    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

                    if (!email) {
                        return done(new Error('No email found in Google profile'), undefined);
                    }

                    // Search by Google ID
                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        return done(null, user);
                    }

                    // If the email already exists in the DB, it will link to the Google Account
                    user = await User.findOne({ email });

                    if (user) {
                        user.googleId = profile.id;
                        user.isVerified = true; // Google Email will be marked as verified
                        await user.save({ validateBeforeSave: false });
                        return done(null, user);
                    }

                    // if haven't account create using Google data
                    user = await User.create({
                        fullName: profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim(),
                        email: email,
                        googleId: profile.id,
                        isVerified: true, // Google Verified
                        role: 'user',
                    });

                    return done(null, user);
                } catch (error) {
                    return done(error as Error, undefined);
                }
            }
        )
    );
}

export default passport;