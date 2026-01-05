import ActivityLog from "../models/activityLog.model";

export const createLog = async(logData : {
    admin: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
}) => {
    try {
        await ActivityLog.create(logData);
    } catch (error) {
        console.error("Failed to create activity log:", error);
    }
};