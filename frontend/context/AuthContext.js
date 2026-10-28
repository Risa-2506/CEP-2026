import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI, setGlobalToken, getApiBaseUrl } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setGlobalToken(token);
  }, [token]);

  useEffect(() => {
    console.log("📍 Connected to API Base:", getApiBaseUrl());
  }, []);

  const isLoggedIn = !!user && !!token;

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authAPI.login(email, password);

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
      const data = await authAPI.signup(name, email, password);

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

  const alzheimerSignup = async (details) => {
    setLoading(true);
    try {
      const data = await authAPI.alzheimerSignup(details);

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
      const data = await authAPI.elderlySignup(details);

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
    setGlobalToken(null);
  };

  // Refresh user data from server
  const refreshUser = async () => {
    if (!token) return;
    try {
      const data = await authAPI.getMe(token);
      if (data && data._id) {
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
