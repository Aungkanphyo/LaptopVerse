/**
 * Safely parses a JSON string or returns the original data if it's already an object/invalid JSON.
 */
export const safeJsonParse = <T = any>(data: any): T | null => {
    if (typeof data === 'string') {
        try {
            return JSON.parse(data) as T;
        } catch (error) {
            return null;
        }
    }
    return data as T;
};