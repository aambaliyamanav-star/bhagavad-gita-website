
import { createContext, useContext, useState, useEffect } from "react";
import { isTokenExpired } from "../utils/authHelper.js";

// =====================================================
// AUTH CONTEXT
// =====================================================

const AuthContext = createContext();

// =====================================================
// AUTH PROVIDER
// =====================================================

export function AuthProvider({ children }) {
  // Get saved token from localStorage (validate against expiry)
  const [token, setToken] = useState(() => {
    try {
      const savedToken = localStorage.getItem("token");
      if (savedToken && isTokenExpired(savedToken)) {
        console.warn("Stored JWT token has expired. Clearing session.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return null;
      }
      return savedToken || null;
    } catch {
      return null;
    }
  });

  // Get saved user from localStorage (only if token is valid)
  const [user, setUser] = useState(() => {
    try {
      const savedToken = localStorage.getItem("token");
      if (!savedToken || isTokenExpired(savedToken)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return null;
      }

      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("User data error:", error);
      return null;
    }
  });

  // ===================================================
  // LISTEN FOR GLOBAL AUTH EXPIRATION
  // ===================================================

  useEffect(() => {
    const handleExpiredEvent = () => {
      logout();
    };

    window.addEventListener("auth-token-expired", handleExpiredEvent);
    return () => window.removeEventListener("auth-token-expired", handleExpiredEvent);
  }, []);

  // ===================================================
  // LOGIN
  // ===================================================

  const login = (userData, userToken) => {
    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    localStorage.setItem("token", userToken);

    if (userData && userData._id) {
      localStorage.setItem("gita_registered_user_id", userData._id);
    }

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

