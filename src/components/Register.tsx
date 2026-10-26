import { useState } from "react";
import { apiSend, ApiError, type AuthResponse } from "../services/api";

interface RegisterProps {
  onSuccess: (token: string, name: string) => void;
  onGoToLogin: () => void;
}

export default function Register({ onSuccess, onGoToLogin }: RegisterProps) {
  const [name, setName] = useState("");
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
        "/api/auth/register",
        { name, email, password },
        "Erro ao cadastrar.",
        null,
      );
      onSuccess(data.token, data.name);
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Criar conta</h2>
        <p>Cadastre-se para acompanhar seu pet.</p>

        <label>
          Nome
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

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
            minLength={6}
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>

        <p className="auth-switch">
          Já tem conta?{" "}
          <button type="button" onClick={onGoToLogin}>
            Entrar
          </button>
        </p>
      </form>
    </div>
  );
}
