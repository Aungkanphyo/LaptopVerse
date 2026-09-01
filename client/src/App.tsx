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
import ProductList from "./pages/admin/ProductList";
import CreateProduct from "./pages/admin/CreateProduct";
import EditProduct from "./pages/admin/EditProduct";

import AdminLayout from "./components/layout/AdminLayout";
import VerifyOtp from "./features/auth/pages/VerifyOtp";
import BrandList from "./pages/admin/BrandList";
import CategoryList from "./pages/admin/CategoryList";
import Profile from "./features/auth/pages/Profile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "verify-email",
        element: <VerifyOtp />,
      },
      {
        path: "products/:id",
        element: <ProductDetails />
      },
      {
        path: "cart",
        element: <CartScreen />
      },
      {
        path: "/shipping",
        element: <ShippingScreen />
      },
      {
        path: "/payment",
        element: <PaymentScreen />
      },
      {
        path: "/profile",
        element: <Profile />,
      },
    ]
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <ProductList />,
      },
      {
        path: "products",
        element: <ProductList />,
      },
      {
        path: "products/new",
        element: <CreateProduct />,
      },
      {
        path: "products/:id/edit",
        element: <EditProduct />,
      },
      {
        path: "brands",
        element: <BrandList />,
      },
      {
        path: "categories",
        element: <CategoryList />,
      },
      {
        path: "payment-settings",
        element: <ManualPaymentSettings />,
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