import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";

const Home = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
    <h1 className="text-4xl font-extrabold text-gray-900">Welcome to LaptopVerse</h1>
    <p className="mt-4 text-lg text-gray-500">Your ultimate destination for high-performance laptops.</p>
  </div>
);

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
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;