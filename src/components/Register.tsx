import { useState } from "react";

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
            const res = await fetch("http://localhost:3001/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Erro ao cadastrar.");
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
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </label>

                {error && <p className="auth-error">{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Cadastrando..." : "Cadastrar"}
                </button>

                <p className="auth-switch">
                    Já tem conta? <button type="button" onClick={onGoToLogin}>Entrar</button>
                </p>
            </form>
        </div>
    );
}