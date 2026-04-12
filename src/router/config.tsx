import type { RouteObject } from "react-router-dom";
import Home from "../pages/home/page";
import AdminPage from "../pages/admin/page";
import NotFound from "../pages/NotFound";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/admin",
    element: <AdminPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;