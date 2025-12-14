import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "cashier";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "admin" | "cashier"
  ) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  /* -----------------------------------------
     Load user from localStorage at startup
  ------------------------------------------ */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(JSON.parse(storedUser));
    }
  }, []);

  /* -----------------------------------------
     LOGIN
  ------------------------------------------ */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post("/auth/login", { email, password });

      const loggedUser = res.data.user;
      const token = res.data.token;

      // Save credentials
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(loggedUser));

      // Set Authorization header globally
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(loggedUser);
      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  /* -----------------------------------------
     REGISTER
  ------------------------------------------ */
  const register = async (
    name: string,
    email: string,
    password: string,
    role: "admin" | "cashier"
  ): Promise<boolean> => {
    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      return true;
    } catch (err) {
      console.error("Register error:", err);
      return false;
    }
  };

  /* -----------------------------------------
     LOGOUT
  ------------------------------------------ */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    delete api.defaults.headers.common["Authorization"];

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
