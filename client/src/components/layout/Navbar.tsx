import { Link, useNavigate } from "react-router-dom";
import { NavHashLink } from "react-router-hash-link";
import { useAppDispatch, useAppSelector } from "../../hooks/redux.hooks"
import { useLogoutMutation } from "../../features/auth/authApiSlice";
import { logout } from "../../features/auth/authSlice";
import Search from "./Search";
import { GitCompare, ShoppingCart } from "lucide-react";
import { AiAdvisorModal } from "@/features/ai/components/AiAdvisorModal";

const Navbar = () => {
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const { cartItems } = useAppSelector((state) => state.cart);
    const { compareItems } = useAppSelector((state) => state.compare);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [logoutUser] = useLogoutMutation();

    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

    const handleLogout = async () => {
        try {
            await logoutUser({}).unwrap();
            dispatch(logout());
            navigate('/login');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };
    return (
        <nav className="bg-[#0a0d18]/90 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-50 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center gap-6">

                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center gap-2 shrink-0">
                        <div className="size-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                            LV
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight text-white">
                            Laptop<span className="text-blue-500">Verse</span>
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden lg:flex items-center gap-8">
                        <Link
                            to="/buying-guides"
                            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                        >
                            Buying Guides
                        </Link>
                        <NavHashLink
                            smooth
                            to="/#contact"
                            className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                        >
                            Contact Us
                        </NavHashLink>
                    </div>

                    {/* Search Input Container */}
                    <div className="flex-1 max-w-md mx-2">
                        <Search />
                    </div>

                    {/* Right Menu Action Buttons */}
                    <div className="flex items-center gap-4 shrink-0">

                        <AiAdvisorModal />

                        {/* Compare Icon */}
                        <div
                            className="relative p-2 hover:bg-slate-800/60 rounded-full transition-colors group cursor-pointer border border-transparent hover:border-slate-700"
                            title="Compare Laptops"
                        >
                            <GitCompare className="size-6 text-slate-300 group-hover:text-blue-400 transition-colors" />
                            {compareItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold size-5 flex items-center justify-center rounded-full shadow-md">
                                    {compareItems.length}
                                </span>
                            )}
                        </div>

                        {/* Cart Icon */}
                        <Link
                            to="/cart"
                            className="relative p-2 hover:bg-slate-800/60 rounded-full transition-colors group border border-transparent hover:border-slate-700"
                        >
                            <ShoppingCart className="size-6 text-slate-300 group-hover:text-blue-400 transition-colors" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold size-5 flex items-center justify-center rounded-full shadow-md">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Auth Controls */}
                        {isAuthenticated && user ? (
                            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                                <Link
                                    to="/profile"
                                    className="text-sm font-medium text-slate-200 hover:text-blue-400 transition-colors"
                                >
                                    Hi, {user.fullName.split(" ")[0]}
                                </Link>
                                {(user.role === 'admin' || user.role === 'manager') && (
                                    <Link
                                        to="/admin/products"
                                        className="text-sm font-semibold text-slate-400 hover:text-white transition-colors px-2.5 py-1 rounded bg-slate-800/80"
                                    >
                                        Admin
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-semibold text-red-400 hover:text-red-300 transition-colors px-2 py-1"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl border border-slate-700 transition-all"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar