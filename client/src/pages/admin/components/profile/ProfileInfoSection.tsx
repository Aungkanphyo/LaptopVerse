import React, { useState } from "react";
import { User, Upload, Trash2, Loader2 } from "lucide-react";
import { 
    useUpdateProfileMutation, 
    useUploadAvatarMutation, 
    useDeleteAvatarMutation 
} from "@/features/auth/authApiSlice";
import type { StatusMsg } from "./StatusMessage";
import type { IUser } from "@/types/auth.types";
import { isFetchBaseQueryError } from "@/utils/errorHelpers";

interface ProfileInfoSectionProps {
    user: IUser;
    setStatusMsg: (msg: StatusMsg | null) => void;
}

export const ProfileInfoSection: React.FC<ProfileInfoSectionProps> = ({ user, setStatusMsg }) => {
    const [fullName, setFullName] = useState(user.fullName || "");
    const [email, setEmail] = useState(user.email || "");
    const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
    const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();
    const [deleteAvatar, { isLoading: isDeletingAvatar }] = useDeleteAvatarMutation();

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await updateProfile({ fullName, email }).unwrap();
            setStatusMsg({ type: 'success', text: res.message || 'Profile updated successfully' });
        } catch (err: unknown) {
            let errorMessage = 'Failed to update profile';
            if (isFetchBaseQueryError(err)) {
                const errorData = err.data as { message?: string } | undefined;
                errorMessage = errorData?.message || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setStatusMsg({ type: 'error', text: errorMessage });
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await uploadAvatar(formData).unwrap();
            setStatusMsg({ type: 'success', text: res.message || 'Avatar updated successfully' });
        } catch (err: unknown) {
            let errorMessage = 'Failed to upload avatar';
            if (isFetchBaseQueryError(err)) {
                const errorData = err.data as { message?: string } | undefined;
                errorMessage = errorData?.message || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setStatusMsg({ type: 'error', text: errorMessage });
        }
    };

    const handleAvatarDelete = async () => {
        try {
            const res = await deleteAvatar().unwrap();
            setStatusMsg({ type: 'success', text: res.message || 'Avatar removed successfully' });
        } catch (err: unknown) {
            let errorMessage = 'Failed to delete avatar';
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
                <User className="size-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Personal Information</h2>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                    <div className="size-24 rounded-full bg-slate-800 border-2 border-blue-500/30 overflow-hidden flex items-center justify-center text-2xl font-bold text-blue-400">
                        {user.avatar?.url ? (
                            <img src={user.avatar.url} alt="Profile" className="size-full object-cover" />
                        ) : (
                            user.fullName?.charAt(0).toUpperCase()
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        {isUploadingAvatar ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                        Upload New
                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" disabled={isUploadingAvatar} />
                    </label>

                    {user.avatar?.url && (
                        <button
                            onClick={handleAvatarDelete}
                            disabled={isDeletingAvatar}
                            className="bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            {isDeletingAvatar ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                            Remove
                        </button>
                    )}
                </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-[#070913] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#070913] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div className="md:col-span-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        {isUpdatingProfile && <Loader2 className="size-4 animate-spin" />}
                        Save Profile Changes
                    </button>
                </div>
            </form>
        </div>
    );
};