import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader, getWebRequest } from "@tanstack/react-start/server";
import { db } from "~/db";
import { users, businesses } from "~/db/schema";
import { hash, compare } from "bcryptjs";
import { encrypt, decrypt } from "~/lib/session";
import { eq } from "drizzle-orm";

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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, businessName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

// --- Server functions ---

const serverSignup = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string; businessName: string }) => data)
  .handler(async ({ data }) => {
    try {
      // Check if user exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, data.email),
      });

      if (existingUser) {
        return { success: false, error: "User already exists" };
      }

      const passwordHash = await hash(data.password, 10);

      const result = await db.transaction(async (tx) => {
        const [newUser] = await tx
          .insert(users)
          .values({
            email: data.email,
            passwordHash,
          })
          .returning();

        const [newBusiness] = await tx
          .insert(businesses)
          .values({
            userId: newUser.id,
            name: data.businessName,
          })
          .returning();

        return { user: newUser, business: newBusiness };
      });

      const session = await encrypt({ userId: result.user.id });
      setResponseHeader(
        "Set-Cookie",
        `session=${session}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 7}`
      );

      return {
        success: true,
        user: { id: result.user.id, email: result.user.email, name: result.user.name },
      };
    } catch (error: any) {
      console.error("Signup error:", error);
      return { success: false, error: error.message || "Internal server error" };
    }
  });

const serverLogin = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.email, data.email),
      });

      if (!user || !(await compare(data.password, user.passwordHash))) {
        return { success: false, error: "Invalid email or password" };
      }

      const session = await encrypt({ userId: user.id });
      setResponseHeader(
        "Set-Cookie",
        `session=${session}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 7}`
      );

      return {
        success: true,
        user: { id: user.id, email: user.email, name: user.name },
      };
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, error: error.message || "Internal server error" };
    }
  });

const serverLogout = createServerFn({ method: "POST" }).handler(async () => {
  setResponseHeader(
    "Set-Cookie",
    "session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
  );
  return { success: true };
});

const serverGetSession = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const request = getWebRequest();
    if (!request) return { user: null };

    const cookieHeader = request.headers.get("Cookie");
    if (!cookieHeader) return { user: null };

    const sessionCookie = cookieHeader
      .split(";")
      .find((c) => c.trim().startsWith("session="))
      ?.split("=")[1];

    if (!sessionCookie) return { user: null };

    const payload = await decrypt(sessionCookie);
    if (!payload || !payload.userId) return { user: null };

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user) return { user: null };

    return {
      user: { id: user.id, email: user.email, name: user.name },
    };
  } catch (error) {
    return { user: null };
  }
});

// --- Context ---

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    serverGetSession().then(({ user }) => {
      setUser(user);
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await serverLogin({ email, password });
    if (result.success) {
      setUser(result.user);
    }
    return result;
  }, []);

  const signup = useCallback(async (email: string, password: string, businessName: string) => {
    const result = await serverSignup({ email, password, businessName });
    if (result.success) {
      setUser(result.user);
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    await serverLogout();
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