import { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

function getUserFromToken(token) {
  if (!token) return null;

  try {
    const decodedUser = jwtDecode(token);

    // Check token expiration
    if (decodedUser.exp && decodedUser.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return null;
    }

    return decodedUser;
  } catch {
    localStorage.removeItem("token");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token");

    if (!getUserFromToken(storedToken)) {
      return null;
    }

    return storedToken;
  });

  const [user, setUser] = useState(() => {
    const storedToken = localStorage.getItem("token");

    return getUserFromToken(storedToken);
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedToken = localStorage.getItem("token");

    return getUserFromToken(storedToken) !== null;
  });

  const login = (newToken) => {
    const decodedUser = getUserFromToken(newToken);

    if (!decodedUser) {
      return false;
    }

    localStorage.setItem("token", newToken);

    setToken(newToken);
    setUser(decodedUser);
    setIsAuthenticated(true);

    return true;
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}