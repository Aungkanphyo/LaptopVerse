import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Home from "./pages/Home";
import ProductDetails from "./features/products/pages/ProductDetails";
import CartScreen from "./features/cart/CartScreen";
import { Toaster } from "sonner";
import ShippingScreen from "./features/cart/ShippingScreen";
import PaymentScreen from "./features/cart/PaymentScreen";
import ManualPaymentSettings from "./pages/admin/ManualPaymentSettings";
import { useAppSelector } from "./hooks/redux.hooks";
import React from "react";

const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  if (!isAuthenticated || !user || user.role !== "admin") {
    return <div className="container mx-auto px-4 py-10">Not authorized.</div>;
  }
  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout/>,
    children: [
      {
        index: true,
        element: <Home/>,
      },
      {
        path: "login",
        element: <Login/>,
      },
      {
        path: "register",
        element: <Register/>,
      },
      {
        path: "products/:id",
        element: <ProductDetails/>
      },
      {
        path: "cart",
        element: <CartScreen/>
      },
      {
        path: "/shipping",
        element: <ShippingScreen/>
      },
      {
        path: "/payment",
        element: <PaymentScreen/>
      },
      {
        path: "/admin/payment-settings",
        element: (
          <RequireAdmin>
            <ManualPaymentSettings />
          </RequireAdmin>
        ),
      }
    ]
  }
]);

function App() {
  return (
    <>
      <Toaster position="top-center" richColors closeButton />
      <RouterProvider router={router} />
    </>
  );
}

export default App;