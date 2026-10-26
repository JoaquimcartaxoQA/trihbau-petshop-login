// Camada central de acesso à API: base URL configurável (VITE_API_URL)
// e cabeçalho Authorization injetados em um único lugar.

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem("token");
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
  fallbackError: string;
};

async function requestJson<T>(path: string, options: RequestOptions): Promise<T> {
  const { method = "GET", body, token = getAuthToken(), fallbackError } = options;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // Falha de rede: mantém o mesmo contrato de erro para as telas.
    throw new ApiError("Não foi possível conectar ao servidor.", 0);
  }

  const text = await response.text();

  if (!response.ok) {
    let message = fallbackError;
    try {
      const parsed = text ? JSON.parse(text) : null;
      if (parsed && typeof parsed.error === "string") message = parsed.error;
    } catch {
      // Corpo não JSON: usa a mensagem de fallback.
    }
    throw new ApiError(message, response.status);
  }

  if (!text) return null as T;
  return JSON.parse(text) as T;
}

export function apiGet<T>(path: string, fallbackError: string, token?: string | null): Promise<T> {
  return requestJson<T>(path, { fallbackError, token });
}

export function apiSend<T>(
  method: NonNullable<RequestOptions["method"]>,
  path: string,
  body: unknown,
  fallbackError: string,
  token?: string | null,
): Promise<T> {
  return requestJson<T>(path, { method, body, fallbackError, token });
}

export interface Pet {
  id: number;
  breed: string;
  name: string;
  age: number;
  weight: number;
  contactPhone: string;
}

export interface BookingSlot {
  start: string;
  capacity: number;
  booked: number;
  available: number;
}

export interface Appointment {
  id: number;
  date: string;
  slotStart: string;
  service: string;
  petId: number;
  petName: string;
  petBreed: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  image: string;
}

export interface AuthResponse {
  token: string;
  name: string;
}
