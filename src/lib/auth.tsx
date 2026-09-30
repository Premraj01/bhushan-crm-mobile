import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError, loadToken, setToken, setUnauthorizedHandler } from "./api";
import { disconnectSocket } from "./socket";
import { storage } from "./storage";

export type Role = "Admin" | "Doctor" | "Reception";

export const ROLE_LABELS: Record<Role, string> = {
  Admin: "Super Admin",
  Doctor: "Doctor",
  Reception: "Receptionist",
};

export type User = { id: string; name: string; email: string; role: Role; title?: string };

type AuthResponse = { accessToken: string; user: User };

type AuthState = {
  /** `undefined` while the saved session is being restored. */
  user: User | null | undefined;
  signIn: (email: string, password: string) => Promise<void>;
  demoSignIn: (role: Role) => Promise<void>;
  signOut: () => Promise<void>;
};

const USER_KEY = "drb-user";
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  const signOut = useCallback(async () => {
    disconnectSocket();
    await setToken(null);
    await storage.remove(USER_KEY);
    queryClient.clear();
    setUser(null);
  }, [queryClient]);

  // Restore the saved session; the cached user shows at once and is refreshed from /auth/me.
  useEffect(() => {
    (async () => {
      if (!(await loadToken())) return setUser(null);
      const cached = await storage.get(USER_KEY);
      if (cached) setUser(JSON.parse(cached) as User);
      try {
        const me = await api<User>("/auth/me");
        setUser(me);
        await storage.set(USER_KEY, JSON.stringify(me));
      } catch (error) {
        // Offline: keep the cached user. Rejected token: start over.
        if (error instanceof ApiError || !cached) await signOut();
      }
    })();
  }, [signOut]);

  useEffect(() => {
    setUnauthorizedHandler(() => void signOut());
    return () => setUnauthorizedHandler(undefined);
  }, [signOut]);

  const start = useCallback(async (res: AuthResponse) => {
    await setToken(res.accessToken);
    await storage.set(USER_KEY, JSON.stringify(res.user));
    setUser(res.user);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      signOut,
      signIn: async (email, password) =>
        start(await api<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) })),
      demoSignIn: async (role) =>
        start(await api<AuthResponse>("/auth/demo", { method: "POST", body: JSON.stringify({ role }) })),
    }),
    [user, signOut, start],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/** The signed-in user; only call from screens behind the sign-in guard. */
export function useUser(): User {
  const { user } = useAuth();
  if (!user) throw new Error("No signed-in user");
  return user;
}

export function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** "Dr. Sonal Desai" → "Dr. Sonal"; "Priya More" → "Priya" — as the web greeting. */
export function greetingName(name: string) {
  const parts = name.split(/\s+/);
  return /^Dr\.?$/i.test(parts[0] ?? "") ? `${parts[0]} ${parts[1] ?? ""}`.trim() : (parts[0] ?? name);
}
