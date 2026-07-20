import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import * as api from "./api";
import type { MobileUser, NfcTagItem, TransactionItem } from "./api";
import { clearToken, getToken, setToken } from "./secureStorage";

interface AuthState {
  isLoading: boolean;
  user: MobileUser | null;
  balanceCents: number | null;
  transactions: TransactionItem[];
  nfcTags: NfcTagItem[];
  loginWithPin: (memberNumber: string, pin: string) => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshNfcTags: () => Promise<void>;
  addNfcTag: (tagUid: string) => Promise<void>;
  removeNfcTag: (id: string) => Promise<void>;
  pay: (merchantCode: string, amountEuros: number) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<MobileUser | null>(null);
  const [balanceCents, setBalanceCents] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [nfcTags, setNfcTags] = useState<NfcTagItem[]>([]);

  useEffect(() => {
    (async () => {
      const stored = await getToken();
      if (stored) {
        try {
          const me = await api.fetchMe(stored);
          setTokenState(stored);
          setUser(me.user);
          setBalanceCents(me.balanceCents);
          const { transactions: items } = await api.fetchTransactions(stored);
          setTransactions(items);
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
    const me = await api.fetchMe(result.token);
    setUser(me.user);
    setBalanceCents(me.balanceCents);
    const { transactions: items } = await api.fetchTransactions(result.token);
    setTransactions(items);
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
    setTransactions([]);
    setNfcTags([]);
  }, [token]);

  const refreshBalance = useCallback(async () => {
    if (!token) return;
    const me = await api.fetchMe(token);
    setBalanceCents(me.balanceCents);
  }, [token]);

  const refreshTransactions = useCallback(async () => {
    if (!token) return;
    const { transactions: items } = await api.fetchTransactions(token);
    setTransactions(items);
  }, [token]);

  const refreshNfcTags = useCallback(async () => {
    if (!token) return;
    const { tags } = await api.fetchNfcTags(token);
    setNfcTags(tags);
  }, [token]);

  const handleAddNfcTag = useCallback(
    async (tagUid: string) => {
      if (!token) throw new Error("Non authentifié.");
      await api.addNfcTag(token, tagUid);
      await refreshNfcTags();
    },
    [token, refreshNfcTags],
  );

  const handleRemoveNfcTag = useCallback(
    async (id: string) => {
      if (!token) throw new Error("Non authentifié.");
      await api.removeNfcTag(token, id);
      await refreshNfcTags();
    },
    [token, refreshNfcTags],
  );

  const pay = useCallback(
    async (merchantCode: string, amountEuros: number) => {
      if (!token) throw new Error("Non authentifié.");
      await api.payMerchant(token, merchantCode, amountEuros);
      await refreshBalance();
      await refreshTransactions();
    },
    [token, refreshBalance, refreshTransactions],
  );

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        user,
        balanceCents,
        transactions,
        nfcTags,
        loginWithPin: handleLoginWithPin,
        loginWithPassword: handleLoginWithPassword,
        logout: handleLogout,
        refreshBalance,
        refreshTransactions,
        refreshNfcTags,
        addNfcTag: handleAddNfcTag,
        removeNfcTag: handleRemoveNfcTag,
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
