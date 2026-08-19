import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { useAppSelector } from "@/hooks/redux.hooks";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

const AdminLayout = () => {
    const { user, isAuthenticated } = useAppSelector((s) => s.auth);
    const [collapsed, setCollapsed] = useState(false);

    // Protection logic inside the layout as well
    if (!isAuthenticated || !user || (user.role !== "admin" && user.role !== "manager")) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50/50 flex">
            {/* Sidebar */}
            <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            {/* Main Content Area */}
            <div className={cn(
                "flex-1 flex flex-col transition-all duration-300",
                collapsed ? "lg:ml-20" : "lg:ml-64"
            )}>
                {/* Optional Top Header for Admin */}
                <header className="h-16 border-b bg-white flex items-center justify-between px-8 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-medium text-muted-foreground">Admin Dashboard</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-gray-900">{user.fullName}</span>
                            <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                        </div>
                        <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {user.fullName.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <main className="p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
