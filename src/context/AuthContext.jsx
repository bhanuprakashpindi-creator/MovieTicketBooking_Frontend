import { createContext, useContext, useState } from "react";

import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const [user, setUser] = useState(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) return null;
    try {
      return jwtDecode(storedToken);
    } catch {
      localStorage.removeItem("token");
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) return false;
    try {
      jwtDecode(storedToken);
      return true;
    } catch {
      return false;
    }
  });

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
