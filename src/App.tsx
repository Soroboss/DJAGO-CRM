import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { useCrmStore } from './store/crmStore';
import { LandingPage } from './views/LandingPage';
import { Login } from './views/Login';
import { DgDashboard } from './views/DgDashboard';
import { ManagerDashboard } from './views/ManagerDashboard';
import { CommercialDashboard } from './views/CommercialDashboard';
import { SuperAdminDashboard } from './views/SuperAdminDashboard';
import { ToastContainer } from './components/ToastContainer';

function App() {
  const { isAuthenticated, user, login, initializeAuth, isLoading } = useAuthStore();
  const { init } = useCrmStore();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Initialize Auth & Dexie local DB
  useEffect(() => {
    initializeAuth();
    init();
    
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [initializeAuth, init]);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-slate-900">Chargement...</div>;
  }

  // Render correct dashboard screen if logged in
  if (isAuthenticated && user) {
    if (user.role === 'dg') {
      return (
        <>
          <DgDashboard />
          <ToastContainer />
        </>
      );
    }
    if (user.role === 'manager') {
      return (
        <>
          <ManagerDashboard />
          <ToastContainer />
        </>
      );
    }
    if (user.role === 'commercial') {
      return (
        <>
          <CommercialDashboard />
          <ToastContainer />
        </>
      );
    }
    if (user.role === 'superadmin') {
      return (
        <>
          <SuperAdminDashboard />
          <ToastContainer />
        </>
      );
    }
  }

  // Render landing or login screens
  return (
    <>
      {currentPath === '/' && (
        <LandingPage
          onNavigateToLogin={() => navigate('/login')}
        />
      )}
      {currentPath === '/login' && <Login onBack={() => navigate('/')} isAdmin={false} />}
      {currentPath === '/admin' && <Login onBack={() => navigate('/')} isAdmin={true} />}
      {currentPath !== '/' && currentPath !== '/login' && currentPath !== '/admin' && (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
          <h1 className="text-4xl font-bold text-slate-900">404</h1>
          <p className="text-slate-500">Page introuvable</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-brand-orange text-white rounded-xl font-bold">Retour à l'accueil</button>
        </div>
      )}
      <ToastContainer />
    </>
  );
}

export default App;
