import ActivityLog from "../models/activityLog.model";

export const getActivityLogs = async (page: number = 1, limit: number = 20, filters: any = {}) => {
    const skip = (page -1) * limit;

    // search & filter logic
    const query: any = {};
    if (filters.action) query.action = filters.action;
    if (filters.resource) query.resource = filters.resource;
    if (filters.adminId) query.admin = filters.adminId;

    // Parallel Execution with for performance
    const [logs, total] = await Promise.all([
        ActivityLog.find(query)
            .populate('admin', 'fullName Email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        ActivityLog.countDocuments(query)
    ]);

    return {
        logs,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1
        }
    };
};