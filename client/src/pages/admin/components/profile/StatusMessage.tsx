import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

export interface StatusMsg {
    type: 'success' | 'error';
    text: string;
}

interface StatusMessageProps {
    statusMsg: StatusMsg | null;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ statusMsg }) => {
    if (!statusMsg) return null;

    return (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="size-5 shrink-0" /> : <AlertCircle className="size-5 shrink-0" />}
            <span className="text-sm">{statusMsg.text}</span>
        </div>
    );
};