import type { RouteObject } from 'react-router-dom';
import NotFound from '../pages/NotFound';
import Home from '../pages/home/page';
import AdminPage from '../pages/admin/page';
import AdminLoginPage from '../pages/admin-login/page';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/admin-login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin',
    element: <AdminPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;