import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { useCrmStore } from './store/crmStore';
import { LandingPage } from './views/LandingPage';
import { Login } from './views/Login';
import { DgDashboard } from './views/DgDashboard';
import { ManagerDashboard } from './views/ManagerDashboard';
import { CommercialDashboard } from './views/CommercialDashboard';
import { ToastContainer } from './components/ToastContainer';

function App() {
  const { isAuthenticated, user, login, initializeAuth, isLoading } = useAuthStore();
  const { init } = useCrmStore();
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'login'>('landing');

  // Initialize Auth & Dexie local DB
  useEffect(() => {
    initializeAuth();
    init();
  }, [initializeAuth, init]);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Chargement...</div>;
  }

  const handleQuickLogin = async (email: string) => {
    const success = await login(email);
    if (success) {
      setCurrentScreen('landing'); // will be overridden by isAuthenticated in rendering
    }
  };

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
  }

  // Render landing or login screens
  return (
    <>
      {currentScreen === 'landing' ? (
        <LandingPage
          onNavigateToLogin={() => setCurrentScreen('login')}
          onQuickLogin={handleQuickLogin}
        />
      ) : (
        <Login onBack={() => setCurrentScreen('landing')} />
      )}
      <ToastContainer />
    </>
  );
}

export default App;
