import { useState } from "react";

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
            const res = await fetch("http://localhost:3001/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Erro ao entrar.");
                return;
            }

            onSuccess(data.token, data.name);
        } catch {
            setError("Não foi possível conectar ao servidor.");
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
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>

                {error && <p className="auth-error">{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                </button>

                <p className="auth-switch">
                    Não tem conta? <button type="button" onClick={onGoToRegister}>Cadastre-se</button>
                </p>
            </form>
        </div>
    );
}