import React from 'react';
import { createHashRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Lazy load pages
const Landing = React.lazy(() => import('./pages/Landing'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Forget = React.lazy(() => import('./pages/Forget'));
const Layout = React.lazy(() => import('./pages/Layout'));
const Home = React.lazy(() => import('./pages/Home'));
const Gallery = React.lazy(() => import('./pages/Gallery'));
const Folders = React.lazy(() => import('./pages/Folders'));
const Upload = React.lazy(() => import('./pages/Upload'));
const ApiDocs = React.lazy(() => import('./pages/ApiDocs'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Password = React.lazy(() => import('./pages/Password'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// User view pages (non-admin)
const StorageView = React.lazy(() => import('./pages/StorageView'));
const RoleView = React.lazy(() => import('./pages/RoleView'));
const MemberView = React.lazy(() => import('./pages/MemberView'));

// Admin pages
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const Storage = React.lazy(() => import('./pages/admin/Storage'));
const Role = React.lazy(() => import('./pages/admin/Role'));
const Member = React.lazy(() => import('./pages/admin/Member'));
const Settings = React.lazy(() => import('./pages/admin/Settings'));

// Route guards
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  // 检查 is_admin === 1 (数字类型)
  if (!user?.role || user.role.is_admin !== 1) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// Loading fallback
const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export const router = createHashRouter([
  {
    path: '/welcome',
    element: (
      <GuestRoute>
        <React.Suspense fallback={<PageLoading />}>
          <Landing />
        </React.Suspense>
      </GuestRoute>
    ),
  },
  {
    path: '/login',
    element: (
      <GuestRoute>
        <React.Suspense fallback={<PageLoading />}>
          <Login />
        </React.Suspense>
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        <React.Suspense fallback={<PageLoading />}>
          <Register />
        </React.Suspense>
      </GuestRoute>
    ),
  },
  {
    path: '/forget',
    element: (
      <GuestRoute>
        <React.Suspense fallback={<PageLoading />}>
          <Forget />
        </React.Suspense>
      </GuestRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <React.Suspense fallback={<PageLoading />}>
          <Layout />
        </React.Suspense>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <React.Suspense fallback={<PageLoading />}>
            <Home />
          </React.Suspense>
        ),
      },
      {
        path: 'gallery',
        element: (
          <React.Suspense fallback={<PageLoading />}>
            <Gallery />
          </React.Suspense>
        ),
      },
      {
        path: 'folders',
        element: (
          <React.Suspense fallback={<PageLoading />}>
            <Folders />
          </React.Suspense>
        ),
      },
      {
        path: 'upload',
        element: (
          <React.Suspense fallback={<PageLoading />}>
            <Upload />
          </React.Suspense>
        ),
      },
      {
        path: 'api-docs',
        element: (
          <React.Suspense fallback={<PageLoading />}>
            <ApiDocs />
          </React.Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <React.Suspense fallback={<PageLoading />}>
            <Profile />
          </React.Suspense>
        ),
      },
      {
        path: 'password',
        element: (
          <React.Suspense fallback={<PageLoading />}>
            <Password />
          </React.Suspense>
        ),
      },
      {
        path: 'storage-view',
        element: (
          <React.Suspense fallback={<PageLoading />}>
            <StorageView />
          </React.Suspense>
        ),
      },
      {
        path: 'role-view',
        element: (
          <React.Suspense fallback={<PageLoading />}>
            <RoleView />
          </React.Suspense>
        ),
      },
      {
        path: 'member-view',
        element: (
          <React.Suspense fallback={<PageLoading />}>
            <MemberView />
          </React.Suspense>
        ),
      },
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <Outlet />
          </AdminRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: (
              <React.Suspense fallback={<PageLoading />}>
                <Dashboard />
              </React.Suspense>
            ),
          },
          {
            path: 'storage',
            element: (
              <React.Suspense fallback={<PageLoading />}>
                <Storage />
              </React.Suspense>
            ),
          },
          {
            path: 'role',
            element: (
              <React.Suspense fallback={<PageLoading />}>
                <Role />
              </React.Suspense>
            ),
          },
          {
            path: 'member',
            element: (
              <React.Suspense fallback={<PageLoading />}>
                <Member />
              </React.Suspense>
            ),
          },
          {
            path: 'settings',
            element: (
              <React.Suspense fallback={<PageLoading />}>
                <Settings />
              </React.Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: (
      <React.Suspense fallback={<PageLoading />}>
        <NotFound />
      </React.Suspense>
    ),
  },
]);
