import { ClientSession } from "mongoose";
import ActivityLog from "../models/activityLog.model";

export const createLog = async(
        logData : {
        admin: string;
        action: string;
        resource: string;
        resourceId?: string;
        details?: any;
        ipAddress?: string;
        userAgent?: string;
    },
    session?: ClientSession
) => {
    try {
        const log = new ActivityLog(logData);
        await log.save({ session });
    } catch (error) {
        console.error("Failed to create activity log:", error);

        if(session) {
            throw error;
        }
    }
};