import React, { useState } from "react";
import { Eye, EyeOff, Key, Loader2 } from "lucide-react";
import { useUpdatePasswordMutation } from "@/features/auth/authApiSlice";
import type { StatusMsg } from "./StatusMessage";
import { isFetchBaseQueryError } from "@/utils/errorHelpers";

interface PasswordSectionProps {
    setStatusMsg: (msg: StatusMsg | null) => void;
}

interface FieldErrors {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

export const PasswordSection: React.FC<PasswordSectionProps> = ({ setStatusMsg }) => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [updatePassword, { isLoading: isUpdatingPassword }] = useUpdatePasswordMutation();

    const handleInputChange = (
        field: keyof FieldErrors,
        value: string,
        setter: React.Dispatch<React.SetStateAction<string>>
    ) => {
        setter(value);
        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMsg(null);
        setFieldErrors({});
        if (newPassword !== confirmPassword) {
            setFieldErrors({ confirmPassword: "New passwords do not match" });
            return;
        }

        try {
            const res = await updatePassword({ oldPassword, newPassword }).unwrap();
            setStatusMsg({ type: 'success', text: res.message || 'Password updated successfully' });
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setFieldErrors({});
        } catch (err: unknown) {
            let errorMessage = 'Failed to update password';
            if (isFetchBaseQueryError(err)) {
                const errorData = err.data as { message?: string } | undefined;
                errorMessage = errorData?.message || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            // show error message below input box that return from the backend
            const lowerMsg = errorMessage.toLowerCase();
            if (lowerMsg.includes("old password") || lowerMsg.includes("incorrect")) {
                setFieldErrors({ oldPassword: errorMessage });
            } else if (lowerMsg.includes("new password")) {
                setFieldErrors({ newPassword: errorMessage });
            } else {
                setStatusMsg({ type: 'error', text: errorMessage });
            }
        }
    };

    return (
        <div className="bg-[#0e1322] border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Key className="size-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">Change Password</h2>
            </div>

            <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current Password Field */}
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Current Password</label>
                    <div className="relative">
                        <input
                            type={showOldPassword ? "text" : "password"}
                            value={oldPassword}
                            onChange={(e) => handleInputChange("oldPassword", e.target.value, setOldPassword)}
                            className={`w-full bg-[#070913] border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none transition-colors ${fieldErrors.oldPassword
                                ? "border-red-500 focus:border-red-500"
                                : "border-slate-800 focus:border-blue-500"
                                }`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                            {showOldPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                        </button>
                    </div>
                    {fieldErrors.oldPassword && (
                        <p className="text-xs text-red-500 mt-1.5 font-medium">{fieldErrors.oldPassword}</p>
                    )}
                </div>

                {/* New Password Field */}
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">New Password</label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => handleInputChange("newPassword", e.target.value, setNewPassword)}
                            className={`w-full bg-[#070913] border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none transition-colors ${fieldErrors.newPassword
                                ? "border-red-500 focus:border-red-500"
                                : "border-slate-800 focus:border-blue-500"
                                }`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                            {showNewPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                        </button>
                    </div>
                    {fieldErrors.newPassword && (
                        <p className="text-xs text-red-500 mt-1.5 font-medium">{fieldErrors.newPassword}</p>
                    )}
                </div>

                {/* Confirm New Password Field */}
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Confirm New Password</label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => handleInputChange("confirmPassword", e.target.value, setConfirmPassword)}
                            className={`w-full bg-[#070913] border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none transition-colors ${fieldErrors.confirmPassword
                                ? "border-red-500 focus:border-red-500"
                                : "border-slate-800 focus:border-blue-500"
                                }`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                            {showConfirmPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                        </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1.5 font-medium">{fieldErrors.confirmPassword}</p>
                    )}
                </div>

                <div className="md:col-span-3 flex justify-end">
                    <button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isUpdatingPassword && <Loader2 className="size-4 animate-spin" />}
                        Update Password
                    </button>
                </div>
            </form>
        </div>
    );
};