import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyToken = () => {
      const token = localStorage.getItem('studentToken');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('studentToken');
          setIsAuthenticated(false);
        }
      } catch (error) {
        localStorage.removeItem('studentToken');
        setIsAuthenticated(false);
      }
    };

    verifyToken();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Or your custom loader
  }

  return isAuthenticated ? children : <Navigate to="/student-login" replace />;
};

export default ProtectedRoute;