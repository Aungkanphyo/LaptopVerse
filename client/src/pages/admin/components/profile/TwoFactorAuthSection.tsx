import React, { useState } from "react";
import { Shield, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
    useSetup2FAMutation,
    useVerify2FAMutation,
    useDisable2FAMutation
} from "@/features/auth/authApiSlice";
import type { StatusMsg } from "./StatusMessage";
import type { IUser } from "@/types/auth.types";
import { isFetchBaseQueryError } from "@/utils/errorHelpers";

interface TwoFactorAuthSectionProps {
    user: IUser;
    setStatusMsg: (msg: StatusMsg | null) => void;
}

export const TwoFactorAuthSection: React.FC<TwoFactorAuthSectionProps> = ({ user, setStatusMsg }) => {
    const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null);
    const [secretKey, setSecretKey] = useState<string | null>(null);
    const [totpToken, setTotpToken] = useState("");

    const [setup2FA, { isLoading: isSettingUp2FA }] = useSetup2FAMutation();
    const [verify2FA, { isLoading: isVerifying2FA }] = useVerify2FAMutation();
    const [disable2FA, { isLoading: isDisabling2FA }] = useDisable2FAMutation();

    const handleInitiate2FA = async () => {
        try {
            const res = await setup2FA().unwrap();
            setSecretKey(res.secret);
            setOtpauthUrl(res.otpauthUrl);
        } catch (err: unknown) {
            let errorMessage = 'Failed to setup 2FA';
            if (isFetchBaseQueryError(err)) {
                const errorData = err.data as { message?: string } | undefined;
                errorMessage = errorData?.message || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setStatusMsg({ type: 'error', text: errorMessage });
        }
    };

    const handleVerify2FA = async () => {
        if (!totpToken) {
            setStatusMsg({ type: 'error', text: 'Please enter 6-digit verification code' });
            return;
        }
        try {
            const res = await verify2FA({ token: totpToken }).unwrap();
            setStatusMsg({ type: 'success', text: res.message });
            setOtpauthUrl(null);
            setSecretKey(null);
            setTotpToken("");
        } catch (err: unknown) {
            let errorMessage = 'Invalid 2FA code';
            if (isFetchBaseQueryError(err)) {
                const errorData = err.data as { message?: string } | undefined;
                errorMessage = errorData?.message || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setStatusMsg({ type: 'error', text: errorMessage });
        }
    };

    const handleDisable2FA = async () => {
        if (!totpToken) {
            setStatusMsg({ type: 'error', text: 'Enter your 2FA code to confirm disabling' });
            return;
        }
        try {
            const res = await disable2FA({ token: totpToken }).unwrap();
            setStatusMsg({ type: 'success', text: res.message });
            setTotpToken("");
        } catch (err: unknown) {
            let errorMessage = 'Failed to disable 2FA';
            if (isFetchBaseQueryError(err)) {
                const errorData = err.data as { message?: string } | undefined;
                errorMessage = errorData?.message || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setStatusMsg({ type: 'error', text: errorMessage });
        }
    };

    return (
        <div className="bg-[#0e1322] border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Shield className="size-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-white">Two-Factor Authentication (2FA)</h2>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-white">
                        Status: {user.twoFactorEnabled ? <span className="text-emerald-400">Enabled</span> : <span className="text-rose-400">Disabled</span>}
                    </p>
                    <p className="text-xs text-slate-400">Add an extra layer of security using Google Authenticator or similar apps.</p>
                </div>

                {!user.twoFactorEnabled && !otpauthUrl && (
                    <button
                        onClick={handleInitiate2FA}
                        disabled={isSettingUp2FA}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        {isSettingUp2FA && <Loader2 className="size-4 animate-spin" />}
                        Enable 2FA
                    </button>
                )}
            </div>

            {otpauthUrl && (
                <div className="p-4 bg-[#070913] border border-slate-800 rounded-lg space-y-4 max-w-md">
                    <p className="text-xs text-slate-300">Scan this QR Code with your Authenticator App:</p>
                    <div className="flex justify-center p-3 bg-white rounded-lg">
                        <QRCodeSVG value={otpauthUrl} size={176} />
                    </div>
                    {secretKey && (
                        <p className="text-xs text-slate-400 break-all">
                            Secret: <span className="text-blue-400 font-mono select-all">{secretKey}</span>
                        </p>
                    )}

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={totpToken}
                            onChange={(e) => setTotpToken(e.target.value)}
                            maxLength={6}
                            className="flex-1 bg-[#0e1322] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                        />
                        <button
                            onClick={handleVerify2FA}
                            disabled={isVerifying2FA}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            {isVerifying2FA && <Loader2 className="size-4 animate-spin" />}
                            Verify
                        </button>
                    </div>
                </div>
            )}

            {user.twoFactorEnabled && (
                <div className="p-4 bg-[#070913] border border-slate-800 rounded-lg space-y-3 max-w-md">
                    <p className="text-xs text-slate-400">To disable 2FA, enter your current authenticator code below:</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={totpToken}
                            onChange={(e) => setTotpToken(e.target.value)}
                            maxLength={6}
                            className="flex-1 bg-[#0e1322] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                        />
                        <button
                            onClick={handleDisable2FA}
                            disabled={isDisabling2FA}
                            className="bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            {isDisabling2FA && <Loader2 className="size-4 animate-spin" />}
                            Disable 2FA
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};