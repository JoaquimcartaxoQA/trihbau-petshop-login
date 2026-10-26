import { useState } from "react";

// Estado de autenticação da Área do Tutor: sessão no localStorage,
// telas (site/login/register/minha-area) e o fluxo "login antes de agendar".

export type AuthView = "site" | "login" | "register" | "minha-area";

interface Session {
  token: string;
  name: string;
}

function readSession(): Session | null {
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("tutorName");
  return token && name ? { token, name } : null;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(readSession);
  const [authView, setAuthView] = useState<AuthView>(() => (session ? "minha-area" : "site"));
  const [bookingAfterLogin, setBookingAfterLogin] = useState(false);

  function saveSession(token: string, name: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("tutorName", name);
    setSession({ token, name });
  }

  function openLogin() {
    setAuthView("login");
  }

  function openRegister() {
    setAuthView("register");
  }

  // Retorna true quando o login atendeu o fluxo "agendar exige login".
  function completeLogin(token: string, name: string): boolean {
    saveSession(token, name);
    if (bookingAfterLogin) {
      setBookingAfterLogin(false);
      return true;
    }
    setAuthView("minha-area");
    return false;
  }

  function completeRegister(token: string, name: string) {
    setBookingAfterLogin(false);
    saveSession(token, name);
    setAuthView("minha-area");
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("tutorName");
    setSession(null);
    setAuthView("site");
  }

  // Chamado pelos CTAs de agendamento: havendo sessão, devolve-a para o
  // redirecionamento imediato; sem sessão, exige login antes de continuar.
  function ensureSessionForBooking(): Session | null {
    if (session) return session;
    setBookingAfterLogin(true);
    setAuthView("login");
    return null;
  }

  return {
    authView,
    tutorName: session?.name ?? "",
    token: session?.token ?? null,
    openLogin,
    openRegister,
    completeLogin,
    completeRegister,
    logout,
    ensureSessionForBooking,
  };
}
