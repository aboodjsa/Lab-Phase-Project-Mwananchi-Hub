import { createContext, useContext, useEffect, useState } from "react";
import api from "./api";
const C = createContext();
export const useAuth = () => useContext(C);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const save = ({ token, user }) => { localStorage.setItem("token", token); localStorage.setItem("user", JSON.stringify(user)); setUser(user); return user; };
  const login = async (d) => save((await api.post("/auth/login", { email: d.email, password: d.password })).data);
  const register = async (d) => save((await api.post("/auth/register", d)).data);
  const logout = () => { localStorage.clear(); setUser(null); };
  // verify the stored token on app start so stale sessions are cleared
  useEffect(() => { if (localStorage.getItem("token")) api.get("/auth/me").catch(() => {}); }, []);
  return <C.Provider value={{ user, login, register, logout }}>{children}</C.Provider>;
}
