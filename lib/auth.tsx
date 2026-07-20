import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import * as api from "./api";
import type { MobileUser } from "./api";
import { clearToken, getToken, setToken } from "./secureStorage";

interface AuthState {
  isLoading: boolean;
  user: MobileUser | null;
  balanceCents: number | null;
  loginWithPin: (memberNumber: string, pin: string) => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  pay: (merchantCode: string, amountEuros: number) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<MobileUser | null>(null);
  const [balanceCents, setBalanceCents] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await getToken();
      if (stored) {
        try {
          const me = await api.fetchMe(stored);
          setTokenState(stored);
          setUser(me.user);
          setBalanceCents(me.balanceCents);
        } catch {
          await clearToken();
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const applyLogin = useCallback(async (result: api.LoginResult) => {
    await setToken(result.token);
    setTokenState(result.token);
    setUser(result.user);
    const me = await api.fetchMe(result.token);
    setBalanceCents(me.balanceCents);
  }, []);

  const handleLoginWithPin = useCallback(
    async (memberNumber: string, pin: string) => {
      const result = await api.loginWithPin(memberNumber, pin);
      await applyLogin(result);
    },
    [applyLogin],
  );

  const handleLoginWithPassword = useCallback(
    async (email: string, password: string) => {
      const result = await api.loginWithPassword(email, password);
      await applyLogin(result);
    },
    [applyLogin],
  );

  const handleLogout = useCallback(async () => {
    if (token) {
      await api.logout(token);
    }
    await clearToken();
    setTokenState(null);
    setUser(null);
    setBalanceCents(null);
  }, [token]);

  const refreshBalance = useCallback(async () => {
    if (!token) return;
    const me = await api.fetchMe(token);
    setBalanceCents(me.balanceCents);
  }, [token]);

  const pay = useCallback(
    async (merchantCode: string, amountEuros: number) => {
      if (!token) throw new Error("Non authentifié.");
      await api.payMerchant(token, merchantCode, amountEuros);
      await refreshBalance();
    },
    [token, refreshBalance],
  );

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        user,
        balanceCents,
        loginWithPin: handleLoginWithPin,
        loginWithPassword: handleLoginWithPassword,
        logout: handleLogout,
        refreshBalance,
        pay,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}
