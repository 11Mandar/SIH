import React, { createContext, useContext, useState } from "react";

export interface User {
  username: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, pass: string) => boolean;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const DEFAULT_USER: User = {
  username: "siddiqa.bagwan",
  name: "Siddiqa Bagwan",
  email: "siddiqa.bagwan@chetas.sec",
  role: "Lead SOC Analyst",
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_USER,
  isAuthenticated: true,
  login: () => true,
  logout: () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("chetas_user");
    if (saved === "null") return null;
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER; // Default logged in for smooth demo
  });

  const login = (username: string, pass: string) => {
    if (!username.trim() || !pass.trim()) {
      return false;
    }
    const loggedUser: User = {
      username: username.toLowerCase().replace(/\s+/g, "."),
      name: username.includes("@") ? username.split("@")[0] : username,
      email: username.includes("@") ? username : `${username}@chetas.sec`,
      role: "Lead SOC Analyst",
    };
    setUser(loggedUser);
    localStorage.setItem("chetas_user", JSON.stringify(loggedUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.setItem("chetas_user", "null");
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem("chetas_user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
