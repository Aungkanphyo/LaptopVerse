import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import { useAppDispatch, useAppSelector } from "@/hooks/redux.hooks";
import { useEffect } from "react";
import { initializeCart } from "@/features/cart/cartSlice";

const MainLayout = () => {
  const dispatch = useAppDispatch();
  const {user, isAuthenticated } = useAppSelector((state) => state.auth );

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(initializeCart(user._id));
    } else {
      dispatch(initializeCart(undefined));
    }
  }, [isAuthenticated, user, dispatch]);
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar/>
        <main className="grow">
            <Outlet/>
        </main>

        <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} LaptopVerse. All rights reserved.
            </footer>
    </div>
  );
};

export default MainLayout
