import { NextFunction, Request, Response } from "express";
import { createLog } from "../services/logger.service";

/**
 * Request Body ထဲက Sensitive ဖြစ်တဲ့ Data တွေကို [REDACTED] နဲ့ အစားထိုးပေးဖို့ Function
 */
const maskSensitiveData = (data: any) => {
    if(!data || typeof data !== 'object') return data;

    const sensitiveFields = ["password", "token", "newPassword", "oldPassword", "secret", "creditCard"];

    const maskedData = JSON.parse(JSON.stringify(data));

    const mask = (obj: any) => {
        for (const key in obj) {
            if(sensitiveFields.includes(key.toLowerCase())) {
                obj[key] = "[REDACTED]";
            } else if(typeof obj[key] === 'object' && obj[key] !== null) {
                mask(obj[key]); // Recursive call for nested objects
            }
        }
    };

    mask(maskedData);
    return maskedData;
};

export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
    if(req.method === "GET") return next();

    res.on("finish", async() => {
        if(res.statusCode >= 200 && res.statusCode < 300) {
            try {
                const filteredBody = maskSensitiveData(req.body);

                await createLog({
                    admin: req.userId as string,
                    action: `${req.method}_${req.baseUrl.split("/").pop()?.toUpperCase()}`,
                    resource: req.baseUrl.split("/").slice(-1)[0] || "unknown",
                    resourceId: req.params.id,
                    ipAddress: req.ip || req.socket.remoteAddress || "",
                    userAgent: req.headers["user-agent"] || "",
                    details: {
                        path: req.originalUrl,
                        body: filteredBody,
                        method: req.method
                    }
                });
            } catch (error) {
                console.error("Audit Log Error:", error);
                // Audit log မှတ်တဲ့နေရာမှာ error တက်ရင် main logic ကို မထိခိုက်စေဖို့ try-catch သုံးထားတာဖြစ်ပါတယ်
            }
        }
    });
};