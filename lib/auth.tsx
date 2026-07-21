import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import * as api from "./api";
import type { MobileUser, NfcTagItem, ProfileResult, ProfileUpdatePayload, TransactionItem } from "./api";
import { clearToken, getToken, setToken } from "./secureStorage";

interface AuthState {
  isLoading: boolean;
  user: MobileUser | null;
  balanceCents: number | null;
  transactions: TransactionItem[];
  transactionsPage: number;
  transactionsHasMore: boolean;
  nfcTags: NfcTagItem[];
  profile: ProfileResult | null;
  loginWithPin: (memberNumber: string, pin: string) => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  refreshTransactions: (page?: number) => Promise<void>;
  refreshNfcTags: () => Promise<void>;
  addNfcTag: (tagUid: string) => Promise<void>;
  removeNfcTag: (id: string) => Promise<void>;
  pay: (merchantCode: string, amountEuros: number) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: ProfileUpdatePayload) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<MobileUser | null>(null);
  const [balanceCents, setBalanceCents] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsHasMore, setTransactionsHasMore] = useState(false);
  // Ref plutôt que state pour la page "courante" par défaut : évite que
  // refreshTransactions change d'identité à chaque changement de page (ce qui
  // redéclencherait useFocusEffect côté écran, voir app/(tabs)/index.tsx).
  const transactionsPageRef = useRef(1);
  const [nfcTags, setNfcTags] = useState<NfcTagItem[]>([]);
  const [profile, setProfile] = useState<ProfileResult | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await getToken();
      if (stored) {
        try {
          const me = await api.fetchMe(stored);
          setTokenState(stored);
          setUser(me.user);
          setBalanceCents(me.balanceCents);
          const result = await api.fetchTransactions(stored, 1);
          setTransactions(result.transactions);
          setTransactionsPage(result.page);
          transactionsPageRef.current = result.page;
          setTransactionsHasMore(result.hasMore);
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
    const txResult = await api.fetchTransactions(result.token, 1);
    setTransactions(txResult.transactions);
    setTransactionsPage(txResult.page);
    transactionsPageRef.current = txResult.page;
    setTransactionsHasMore(txResult.hasMore);
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
    setTransactionsPage(1);
    transactionsPageRef.current = 1;
    setTransactionsHasMore(false);
    setNfcTags([]);
    setProfile(null);
  }, [token]);

  const refreshBalance = useCallback(async () => {
    if (!token) return;
    const me = await api.fetchMe(token);
    setBalanceCents(me.balanceCents);
  }, [token]);

  const refreshTransactions = useCallback(
    async (page?: number) => {
      if (!token) return;
      const targetPage = page ?? transactionsPageRef.current;
      const result = await api.fetchTransactions(token, targetPage);
      setTransactions(result.transactions);
      setTransactionsPage(result.page);
      transactionsPageRef.current = result.page;
      setTransactionsHasMore(result.hasMore);
    },
    [token],
  );

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
      await refreshTransactions(1);
    },
    [token, refreshBalance, refreshTransactions],
  );

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    const result = await api.fetchProfile(token);
    setProfile(result);
  }, [token]);

  const updateProfile = useCallback(
    async (data: ProfileUpdatePayload) => {
      if (!token) throw new Error("Non authentifié.");
      await api.updateProfile(token, data);
      await refreshProfile();
      const me = await api.fetchMe(token);
      setUser(me.user);
    },
    [token, refreshProfile],
  );

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        user,
        balanceCents,
        transactions,
        transactionsPage,
        transactionsHasMore,
        nfcTags,
        profile,
        loginWithPin: handleLoginWithPin,
        loginWithPassword: handleLoginWithPassword,
        logout: handleLogout,
        refreshBalance,
        refreshTransactions,
        refreshNfcTags,
        addNfcTag: handleAddNfcTag,
        removeNfcTag: handleRemoveNfcTag,
        pay,
        refreshProfile,
        updateProfile,
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
