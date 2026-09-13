import React, { useState } from "react";
import { Key, Loader2 } from "lucide-react";
import { useUpdatePasswordMutation } from "@/features/auth/authApiSlice";
import type { StatusMsg } from "./StatusMessage";

interface PasswordSectionProps {
    setStatusMsg: (msg: StatusMsg | null) => void;
}

export const PasswordSection: React.FC<PasswordSectionProps> = ({ setStatusMsg }) => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [updatePassword, { isLoading: isUpdatingPassword }] = useUpdatePasswordMutation();

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setStatusMsg({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        try {
            const res = await updatePassword({ oldPassword, newPassword }).unwrap();
            setStatusMsg({ type: 'success', text: res.message || 'Password updated successfully' });
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setStatusMsg({ type: 'error', text: err?.data?.message || 'Failed to update password' });
        }
    };

    return (
        <div className="bg-[#0e1322] border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Key className="size-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">Change Password</h2>
            </div>

            <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Current Password</label>
                    <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full bg-[#070913] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[#070913] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Confirm New Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#070913] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div className="md:col-span-3 flex justify-end">
                    <button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        {isUpdatingPassword && <Loader2 className="size-4 animate-spin" />}
                        Update Password
                    </button>
                </div>
            </form>
        </div>
    );
};