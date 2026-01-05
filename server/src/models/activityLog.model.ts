import mongoose, { Model, Schema } from "mongoose";

export interface IActivityLog extends Document {
    admin: mongoose.Types.ObjectId; // Admin user who performed the action
    action: string; // e.g., "CREATE_PRODUCT", "BAN_USER"
    resource: string; // e.g., "Product", "User"
    resourceId?: string; // specific product or user ID
    details?: any;
    ipAddress?: string;
    userAgent: string;
    createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
    {
        admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        action: { type: String, required: true },
        resource: { type: String, required: true },
        resourceId: { type: String },
        details: { type: Schema.Types.Mixed },
        ipAddress: { type: String },
        userAgent: { type: String }
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const ActivityLog: Model<IActivityLog> = mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
export default ActivityLog;