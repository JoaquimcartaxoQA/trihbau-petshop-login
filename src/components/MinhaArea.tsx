interface MinhaAreaProps {
    name: string;
    onLogout: () => void;
}

export default function MinhaArea({ name, onLogout }: MinhaAreaProps) {
    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Olá, {name}! 🐾</h2>
                <p>Bem-vindo à sua área de tutor.</p>

                <div className="minha-area-placeholder">
                    <p><strong>Meus pets</strong></p>
                    <p className="auth-hint">Nenhum pet cadastrado ainda.</p>

                    <p><strong>Próximos agendamentos</strong></p>
                    <p className="auth-hint">Nenhum agendamento encontrado.</p>
                </div>

                <button type="button" onClick={onLogout}>Sair</button>
            </div>
        </div>
    );
}