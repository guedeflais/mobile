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
