import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Home from "./pages/Home";
import ProductDetails from "./features/products/pages/ProductDetails";
import CartScreen from "./features/cart/CartScreen";
import { Toaster } from "sonner";
import ShippingScreen from "./features/cart/ShippingScreen";

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