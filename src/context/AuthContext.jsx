import { createContext, useContext, useEffect, useState } from "react";

import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [user, setUser] = useState(null);

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token"),
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      return;
    }

    try {
      const decodedUser = jwtDecode(storedToken);

      setUser(decodedUser);
      setToken(storedToken);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Invalid token");

      localStorage.removeItem("token");

      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);

    const decodedUser = jwtDecode(newToken);

    setToken(newToken);
    setUser(decodedUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        login,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
