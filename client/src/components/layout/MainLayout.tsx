import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import { useAppDispatch, useAppSelector } from "@/hooks/redux.hooks";
import { useEffect } from "react";
import { initializeCart } from "@/features/cart/cartSlice";
import OAuthHandler from "../common/OAuthHandler";
import CompareBar from "@/features/compare/components/CompareBar";

const MainLayout = () => {
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated && user) {
            dispatch(initializeCart(user._id));
        } else {
            dispatch(initializeCart(undefined));
        }
    }, [isAuthenticated, user, dispatch]);
    return (
        <div className="min-h-screen flex flex-col bg-[#070913] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
            <OAuthHandler />
            <Navbar />
            <main className="grow">
                <Outlet />
            </main>
            <CompareBar />

            <footer className="bg-[#0a0d18] border-t border-slate-800/80 py-8 text-center text-xs font-medium text-slate-500">
                <div className="max-w-7xl mx-auto px-4">
                    &copy; {new Date().getFullYear()} LaptopVerse Inc. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default MainLayout
