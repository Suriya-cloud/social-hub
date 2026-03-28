import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/common/Header';
import routes from './routes';

function ProtectedRoute({ children, requiresAuth }: { children: React.ReactNode; requiresAuth?: boolean }) {
  const { isAuthenticated } = useAuth();

  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!requiresAuth && isAuthenticated && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              {routes.map((route, index) => (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    <ProtectedRoute requiresAuth={route.requiresAuth}>
                      {route.element}
                    </ProtectedRoute>
                  }
                />
              ))}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
