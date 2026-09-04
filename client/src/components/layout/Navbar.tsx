import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux.hooks"
import { useLogoutMutation } from "../../features/auth/authApiSlice";
import { logout } from "../../features/auth/authSlice";
import Search from "./Search";
import { GitCompare, ShoppingCart } from "lucide-react";

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
        <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* logo & Brand */}
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl font-extrabold text-blue-600">LaptopVerse</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6 mx-4">
                        <Link 
                            to="/buying-guides" 
                            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            Buying Guides
                        </Link>
                        <Link 
                            to="/#contact" 
                            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            Contact Us
                        </Link>
                    </div>

                    <div className="flex-1 flex justify-center">
                        <Search />
                    </div>

                    {/* Right menu */}
                    <div className="flex items-center gap-5">
                        <div className="relative p-2 hover:bg-gray-50 rounded-full transition-colors group cursor-pointer" title="Compare Laptops">
                            <GitCompare className="size-6 text-gray-700 group-hover:text-blue-600" />
                            {compareItems.length > 0 && (
                                <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold size-5 flex items-center justify-center rounded-full border-2 border-white">
                                    {compareItems.length}
                                </span>
                            )}
                        </div>

                        {/* Cart Icon with Badge */}
                        <Link to="/cart" className="relative p-2 hover:bg-gray-50 rounded-full transition-colors group">
                            <ShoppingCart className="size-6 text-gray-700 group-hover:text-blue-600" />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold size-5 flex items-center justify-center rounded-full border-2 border-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {isAuthenticated && user ? (
                            <>
                                <Link
                                    to="/profile"
                                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors px-2 py-1 rounded-md hover:bg-gray-50"
                                >
                                    Hi, {user.fullName}
                                </Link>
                                {(user.role === 'admin' || user.role === 'manager') && (
                                    <Link
                                        to="/admin/products"
                                        className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
                                    >
                                        Admin
                                    </Link>
                                )}
                                <button onClick={handleLogout}
                                    className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors px-3 py-2 rounded-md hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar