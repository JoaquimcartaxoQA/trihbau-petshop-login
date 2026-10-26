import { useState } from "react";
import { apiSend, ApiError, type AuthResponse } from "../services/api";

interface LoginProps {
  onSuccess: (token: string, name: string) => void;
  onGoToRegister: () => void;
}

export default function Login({ onSuccess, onGoToRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiSend<AuthResponse>(
        "POST",
        "/api/auth/login",
        { email, password },
        "Erro ao entrar.",
        null,
      );
      onSuccess(data.token, data.name);
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "Erro ao entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Área do Tutor</h2>
        <p>Entre para acompanhar seu pet.</p>

        <label>
          E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="auth-switch">
          Não tem conta?{" "}
          <button type="button" onClick={onGoToRegister}>
            Cadastre-se
          </button>
        </p>
      </form>
    </div>
  );
}
