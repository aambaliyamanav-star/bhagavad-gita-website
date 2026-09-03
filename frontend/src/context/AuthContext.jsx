
import { createContext, useContext, useState } from "react";

// =====================================================
// AUTH CONTEXT
// =====================================================

const AuthContext = createContext();

// =====================================================
// AUTH PROVIDER
// =====================================================

export function AuthProvider({ children }) {
  // Get saved user from localStorage
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");

      return savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch (error) {
      console.error("User data error:", error);
      return null;
    }
  });

  // Get saved token from localStorage
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  // ===================================================
  // LOGIN
  // ===================================================

  const login = (userData, userToken) => {
    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    localStorage.setItem("token", userToken);

    setUser(userData);
    setToken(userToken);
  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
    setToken(null);
  };

  // ===================================================
  // AUTH STATUS
  // ===================================================

  const isLoggedIn = !!token && !!user;

  // ===================================================
  // PROVIDER
  // ===================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn,
        login,
        logout,
        setUser,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =====================================================
// CUSTOM HOOK
// =====================================================

export function useAuth() {
  return useContext(AuthContext);
}

