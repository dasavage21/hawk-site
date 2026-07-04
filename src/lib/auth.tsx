import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "@tanstack/react-router";

// --- Types ---

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  signup: (email: string, password: string, businessName: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
}

// --- API helpers ---

async function apiPost(path: string, body: unknown) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function apiGetSession() {
  try {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    return data.user ? { user: data.user } : { user: null };
  } catch {
    return { user: null };
  }
}

// --- Context ---

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGetSession().then(({ user }) => {
      setUser(user);
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiPost("/api/auth/login", { email, password });
    if (result.success) {
      setUser(result.user);
    }
    return result;
  }, []);

  const signup = useCallback(async (email: string, password: string, businessName: string) => {
    const result = await apiPost("/api/auth/signup", { email, password, businessName });
    if (result.success) {
      setUser(result.user);
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    await apiPost("/api/auth/logout", {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.navigate({ to: "/login" });
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);

  return auth;
}