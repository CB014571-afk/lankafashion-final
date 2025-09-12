import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  // Rehydrate on refresh
  useEffect(() => {
    const t = localStorage.getItem("token");
    const r = localStorage.getItem("role");
    const u = localStorage.getItem("user");
    if (t) setToken(t);
    if (r) setRole(r);
    if (u) setUser(JSON.parse(u));
  }, []);

  const login = (tokenValue, userRole, userObj) => {
    setToken(tokenValue);
    setRole(userRole);
    setUser(userObj || null);

    localStorage.setItem("token", tokenValue);
    localStorage.setItem("role", userRole);
    if (userObj) {
      localStorage.setItem("user", JSON.stringify(userObj));
      if (userObj._id) {
        localStorage.setItem("userId", userObj._id);
      }
    }
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ token, role, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { AuthContext };
