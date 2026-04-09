import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
if (!BASE_URL) {
  console.error("❌ EXPO_PUBLIC_API_URL is NOT defined in your .env file!");
} else {
  console.log("📍 API URL configured as:", BASE_URL);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = !!user && !!token;

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        linkedPatientId: data.linkedPatientId,
        linkedPatientName: data.linkedPatientName,
        linkedPatientType: data.linkedPatientType,
      });
      setToken(data.token);
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      });
      setToken(data.token);
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const alzheimerSignup = async (details) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/alzheimer-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Alzheimer Signup failed");
      }

      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        linkedPatientId: data.linkedPatientId,
        linkedPatientName: data.linkedPatientName,
        linkedPatientType: data.linkedPatientType,
      });
      setToken(data.token);
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const elderlySignup = async (details) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/elderly-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Elderly Signup failed");
      }

      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        linkedPatientId: data.linkedPatientId,
        linkedPatientName: data.linkedPatientName,
        linkedPatientType: data.linkedPatientType,
      });
      setToken(data.token);
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  // Refresh user data from server
  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUser({
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          linkedPatientId: data.linkedPatientId,
          linkedPatientName: data.linkedPatientName,
          linkedPatientType: data.linkedPatientType,
        });
      }
    } catch (error) {
      console.log("Failed to refresh user:", error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn,
        loading,
        login,
        signup,
        alzheimerSignup,
        elderlySignup,
        logout,
        refreshUser,
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
