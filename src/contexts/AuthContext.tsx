import apiClient from "@/lib/api";
import type { ApiSuccessResponse } from "@/types/api";
import type { AuthContextType, LoginResponse, User } from "@/types/auth";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const AuthContext = createContext<AuthContextType | null>(null);
// we still have to take care of the null in case that the context is used outside of the provider
// in the provider, the context value would always be AuthContextType

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // only run during first mount
    const token = localStorage.getItem("bearerToken");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser)); // we have to parse when values are taken from local storage
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response: ApiSuccessResponse<LoginResponse> = await apiClient.post(
      "/login",
      { email, password }
    );

    const { user, token } = response.data;

    localStorage.setItem("bearerToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = async () => {
    await apiClient.post("/logout");
    localStorage.removeItem("bearerToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
