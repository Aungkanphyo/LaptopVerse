import React from "react";
import { Monitor, Loader2 } from "lucide-react";
import { useGetSessionsQuery, useRevokeSessionMutation } from "@/features/auth/authApiSlice";

export interface Session {
    _id: string;
    userAgent: string;
    ip: string;
    lastActive: string | Date;
}

export const ActiveSessionsSection: React.FC = () => {
    const { data: sessionData, isLoading: isLoadingSessions } = useGetSessionsQuery();
    const [revokeSession] = useRevokeSessionMutation();

    return (
        <div className="bg-[#0e1322] border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Monitor className="size-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Active Sessions</h2>
            </div>

            {isLoadingSessions ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Loader2 className="size-4 animate-spin" /> Loading active sessions...
                </div>
            ) : sessionData?.sessions && sessionData.sessions.length > 0 ? (
                <div className="space-y-3">
                    {sessionData.sessions.map((session: Session) => (
                        <div key={session._id} className="flex items-center justify-between p-3 bg-[#070913] border border-slate-800/80 rounded-lg text-xs">
                            <div>
                                <p className="font-medium text-slate-200">{session.userAgent}</p>
                                <p className="text-slate-400">IP: {session.ip} • Last Active: {new Date(session.lastActive).toLocaleString()}</p>
                            </div>
                            <button
                                onClick={() => revokeSession(session._id)}
                                className="text-rose-400 hover:text-rose-300 font-medium border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 rounded transition-colors"
                            >
                                Revoke
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-slate-400">No active device sessions found.</p>
            )}
        </div>
    );
};