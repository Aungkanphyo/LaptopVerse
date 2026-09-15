import { useState } from "react";
import { useAppSelector } from "@/hooks/redux.hooks";
import { StatusMessage, type StatusMsg } from "./components/profile/StatusMessage";
import { ProfileInfoSection } from "./components/profile/ProfileInfoSection";
import { PasswordSection } from "./components/profile/PasswordSection";
import { TwoFactorAuthSection } from "./components/profile/TwoFactorAuthSection";
import { ActiveSessionsSection } from "./components/profile/ActiveSessionsSection";

export const AdminProfile = () => {
    const { user } = useAppSelector((state) => state.auth);
    const [statusMsg, setStatusMsg] = useState<StatusMsg | null>(null);
    if (!user) {
        return <div className="text-white p-4">Loading user profile...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Admin Profile Settings</h1>
                <p className="text-sm text-slate-400">Manage account details, profile picture, security and active sessions.</p>
            </div>

            <StatusMessage statusMsg={statusMsg} />
            <ProfileInfoSection key={user._id} user={user} setStatusMsg={setStatusMsg} />
            <PasswordSection setStatusMsg={setStatusMsg} />
            <TwoFactorAuthSection user={user} setStatusMsg={setStatusMsg} />
            <ActiveSessionsSection />
        </div>
    );
};

export default AdminProfile;