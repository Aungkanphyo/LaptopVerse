import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Package,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Laptop,
    Bookmark,
    Tags,
    ReceiptIcon,
    BookOpen,
    Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/hooks/redux.hooks';
import { useLogoutMutation } from '@/features/auth/authApiSlice';
import { logout } from '@/features/auth/authSlice';

interface SidebarItemProps {
    to: string;
    icon: React.ElementType;
    label: string;
    collapsed: boolean;
    active: boolean;
}

const SidebarItem = ({ to, icon: Icon, label, collapsed, active }: SidebarItemProps) => {
    return (
        <Link
            to={to}
            className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group font-medium text-sm",
                active
                    ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.35)] font-semibold"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
            )}
        >
            <Icon className={cn("size-5 shrink-0 transition-colors", active ? "text-white" : "text-slate-400 group-hover:text-white")} />
            {!collapsed && <span className="truncate">{label}</span>}
        </Link>
    );
};

interface AdminSidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

export const AdminSidebar = ({ collapsed, setCollapsed }: AdminSidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [logoutUser] = useLogoutMutation();

    const handleLogout = async () => {
        try {
            await logoutUser({}).unwrap();
            dispatch(logout());
            navigate('/login');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const menuItems = [
        { to: '/admin/products', icon: Package, label: 'Manage Products' },
        { to: '/admin/transactions', icon: ReceiptIcon, label: 'Transactions' },
        { to: '/admin/brands', icon: Bookmark, label: 'Manage Brands' },
        { to: '/admin/categories', icon: Tags, label: 'Manage Categories' },
        { to: '/admin/payment-settings', icon: Settings, label: 'Payment Settings' },
        { to: '/admin/guides', icon: BookOpen, label: 'Manage Buying Guides' },
        { to: '/admin/contact-settings', icon: Phone, label: 'Contact Settings' },
    ];

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen border-r border-slate-800/80 bg-[#0e1322] transition-all duration-300 ease-in-out flex flex-col text-slate-300",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Logo Section */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800/80">
                {!collapsed && (
                    <Link to="/" className="flex items-center gap-2 font-black text-xl tracking-tight text-white">
                        <div className="size-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]">
                            <Laptop className="size-5" />
                        </div>
                        <span className="bg-linear-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">LaptopVerse</span>
                    </Link>
                )}
                {collapsed && (
                    <Link to="/" className="mx-auto text-blue-500">
                        <Laptop className="size-6" />
                    </Link>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl"
                >
                    {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
                </Button>
            </div>

            {/* Navigation Section */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                <div className={cn("px-3 mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 transition-opacity duration-300", collapsed ? "opacity-0" : "opacity-100")}>
                    Main Menu
                </div>
                {menuItems.map((item) => (
                    <SidebarItem
                        key={item.to}
                        to={item.to}
                        icon={item.icon}
                        label={item.label}
                        collapsed={collapsed}
                        active={location.pathname === item.to || (item.to !== '/admin' && location.pathname.startsWith(item.to))}
                    />
                ))}
            </div>

            {/* Footer Section */}
            <div className="p-4 border-t border-slate-800/80 bg-[#070913]/40">
                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className={cn(
                        "w-full justify-start gap-3 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer transition-colors",
                        collapsed && "px-0 justify-center"
                    )}
                >
                    <LogOut className="size-5" />
                    {!collapsed && <span className="font-semibold">Logout</span>}
                </Button>
            </div>
        </aside>
    );
};
