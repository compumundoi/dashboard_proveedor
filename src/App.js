import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import HotelDashboard from './components/HotelDashboard';
import RestaurantDashboard from './components/RestaurantDashboard';
import ExperienceDashboard from './components/ExperienceDashboard';
import TransportDashboard from './components/TransportDashboard';
import authService from './services/authService';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si el usuario ya está autenticado al cargar la aplicación
    const checkAuthentication = () => {
      const authenticated = authService.isAuthenticated();
      
      if (authenticated) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    };

    checkAuthentication();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  // Componente de ruta protegida
  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Verificando autenticación...</p>
          </div>
        </div>
      );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  // Componente para redirigir según tipo de usuario
  const DashboardRouter = () => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    switch (user.tipo_usuario) {
      case 'hotel':
        return <HotelDashboard user={user} onLogout={handleLogout} />;
      case 'restaurante':
        return <RestaurantDashboard user={user} onLogout={handleLogout} />;
      case 'tour':
        return <ExperienceDashboard user={user} onLogout={handleLogout} />;
      case 'transporte':
        return <TransportDashboard user={user} onLogout={handleLogout} />;
      default:
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Tipo de usuario no reconocido
              </h2>
              <p className="text-gray-600 mb-4">
                El tipo de usuario "{user.tipo_usuario}" no está configurado.
              </p>
              <button 
                onClick={handleLogout}
                className="btn-primary"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta de login */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Login onLoginSuccess={handleLoginSuccess} />
            } 
          />
          
          {/* Ruta del dashboard (protegida) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            } 
          />
          
          {/* Ruta por defecto */}
          <Route 
            path="/" 
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
            } 
          />
          
          {/* Ruta 404 */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Página no encontrada
                  </h2>
                  <p className="text-gray-600 mb-4">
                    La página que buscas no existe.
                  </p>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="btn-primary"
                  >
                    Ir al inicio
                  </button>
                </div>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
