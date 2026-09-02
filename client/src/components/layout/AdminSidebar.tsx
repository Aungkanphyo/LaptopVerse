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
    ReceiptIcon
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
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                active 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
        >
            <Icon className={cn("size-5 shrink-0", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground")} />
            {!collapsed && <span className="font-medium truncate">{label}</span>}
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
        {
            to: '/admin/products',
            icon: Package,
            label: 'Manage Products',
        },
        {
            to: '/admin/transactions',
            icon: ReceiptIcon,
            label: 'Transactions',
        },
        {
            to: '/admin/brands',
            icon: Bookmark,
            label: 'Manage Brands',
        },
        {
            to: '/admin/categories',
            icon: Tags,
            label: 'Manage Categories',
        },
        {
            to: '/admin/payment-settings',
            icon: Settings,
            label: 'Payment Settings',
        },
    ];

    return (
        <aside 
            className={cn(
                "fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300 ease-in-out flex flex-col",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Logo Section */}
            <div className="flex h-16 items-center justify-between px-4 border-b">
                {!collapsed && (
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
                        <Laptop className="size-6" />
                        <span>LaptopVerse</span>
                    </Link>
                )}
                {collapsed && (
                    <Link to="/" className="mx-auto text-primary">
                        <Laptop className="size-6" />
                    </Link>
                )}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex"
                >
                    {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
                </Button>
            </div>

            {/* Navigation Section */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
                <div className={cn("px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-opacity duration-300", collapsed ? "opacity-0" : "opacity-100")}>
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
            <div className="p-4 border-t bg-accent/5">
                <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className={cn(
                        "w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10",
                        collapsed && "px-0 justify-center"
                    )}
                >
                    <LogOut className="size-5" />
                    {!collapsed && <span className="font-medium">Logout</span>}
                </Button>
            </div>
        </aside>
    );
};
