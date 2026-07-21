import { API_BASE_URL } from "./config";

export interface MobileUser {
  id: string;
  email: string;
  fullName: string;
  accountType: string;
  staffRole: string | null;
  merchantId: string | null;
  // Absent de la réponse de connexion (/api/mobile/login), présent via
  // /api/mobile/me — auth.tsx recharge le profil complet après connexion.
  merchantCode?: string | null;
}

export interface LoginResult {
  token: string;
  expiresAt: string;
  user: MobileUser;
}

export interface MeResult {
  user: MobileUser;
  balanceCents: number;
}

export type TransactionType = "PURCHASE" | "PAYMENT" | "CONVERSION" | "EXPIRY";
export type TransactionStatus = "PENDING" | "COMPLETED" | "REJECTED";

export interface TransactionItem {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amountCents: number;
  isOutgoing: boolean;
  counterpartyLabel: string | null;
  createdAt: string;
}

async function parseOrThrow(response: Response) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof data?.error === "string" ? data.error : "Une erreur est survenue.");
  }
  return data;
}

export async function loginWithPin(memberNumber: string, pin: string): Promise<LoginResult> {
  const response = await fetch(`${API_BASE_URL}/api/mobile/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memberNumber, pin }),
  });
  return parseOrThrow(response);
}

export async function loginWithPassword(email: string, password: string): Promise<LoginResult> {
  const response = await fetch(`${API_BASE_URL}/api/mobile/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parseOrThrow(response);
}

export async function fetchMe(token: string): Promise<MeResult> {
  const response = await fetch(`${API_BASE_URL}/api/mobile/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseOrThrow(response);
}

export async function logout(token: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/mobile/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export interface TransactionsResult {
  transactions: TransactionItem[];
  page: number;
  hasMore: boolean;
}

export async function fetchTransactions(token: string, page = 1): Promise<TransactionsResult> {
  const response = await fetch(`${API_BASE_URL}/api/mobile/transactions?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseOrThrow(response);
}

export interface NfcTagItem {
  id: string;
  tagUid: string;
  createdAt: string;
}

export async function fetchNfcTags(token: string): Promise<{ tags: NfcTagItem[] }> {
  const response = await fetch(`${API_BASE_URL}/api/mobile/nfc-tags`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseOrThrow(response);
}

export async function addNfcTag(token: string, tagUid: string): Promise<{ tag: NfcTagItem }> {
  const response = await fetch(`${API_BASE_URL}/api/mobile/nfc-tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ tagUid }),
  });
  return parseOrThrow(response);
}

export async function removeNfcTag(token: string, id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/mobile/nfc-tags/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ id }),
  });
  await parseOrThrow(response);
}

export interface MerchantProfileInfo {
  businessName: string;
  address: string;
  category: string;
  iban: string;
}

export interface ProfileResult {
  fullName: string;
  email: string;
  merchant?: MerchantProfileInfo;
}

export interface ProfileUpdatePayload {
  fullName: string;
  email: string;
  merchant?: MerchantProfileInfo;
}

export class ProfileUpdateError extends Error {
  fieldErrors: Record<string, string>;
  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

export async function fetchProfile(token: string): Promise<ProfileResult> {
  const response = await fetch(`${API_BASE_URL}/api/mobile/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseOrThrow(response);
}

export async function updateProfile(token: string, payload: ProfileUpdatePayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/mobile/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ProfileUpdateError(
      typeof data?.error === "string" ? data.error : "Impossible de mettre à jour le profil.",
      data?.fieldErrors ?? {},
    );
  }
}

export async function payMerchant(
  token: string,
  merchantCode: string,
  amountEuros: number,
): Promise<{ id: string }> {
  const response = await fetch(`${API_BASE_URL}/api/mobile/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ merchantCode, amountEuros }),
  });
  return parseOrThrow(response);
}

export async function requestConversion(token: string, amountEuros: number): Promise<{ id: string }> {
  const response = await fetch(`${API_BASE_URL}/api/mobile/conversions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ amountEuros }),
  });
  return parseOrThrow(response);
}
