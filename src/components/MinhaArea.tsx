import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

interface MinhaAreaProps {
    name: string;
    token: string;
    onLogout: () => void;
}

interface Pet {
    id: number;
    breed: string;
    name: string;
    age: number;
    weight: number;
    contactPhone: string;
}

const emptyPet = { breed: "", name: "", age: "", weight: "", contactPhone: "" };

export default function MinhaArea({ name, token, onLogout }: MinhaAreaProps) {
    const [pets, setPets] = useState<Pet[]>([]);
    const [pet, setPet] = useState(emptyPet);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingPetId, setEditingPetId] = useState<number | null>(null);

    useEffect(() => {
        async function loadPets() {
            try {
                const response = await fetch("http://localhost:3001/api/auth/pets", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error("Não foi possível carregar os pets.");
                setPets(await response.json());
            } catch (requestError) {
                setError(requestError instanceof Error ? requestError.message : "Erro ao carregar os pets.");
            } finally {
                setLoading(false);
            }
        }

        void loadPets();
    }, [token]);

    function updatePet(field: keyof typeof emptyPet, value: string) {
        setPet((current) => ({ ...current, [field]: value }));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setSaving(true);

        try {
            const isEditing = editingPetId !== null;
            const response = await fetch(`http://localhost:3001/api/auth/pets${isEditing ? `/${editingPetId}` : ""}`, {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ...pet, age: Number(pet.age), weight: Number(pet.weight) }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Não foi possível salvar o pet.");
            setPets((current) => {
                const updated = isEditing ? current.map((item) => item.id === data.id ? data : item) : [...current, data];
                return updated.sort((left, right) => left.name.localeCompare(right.name));
            });
            setPet(emptyPet);
            setEditingPetId(null);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Erro ao cadastrar o pet.");
        } finally {
            setSaving(false);
        }
    }

    function startEditing(item: Pet) {
        setEditingPetId(item.id);
        setPet({ breed: item.breed, name: item.name, age: String(item.age), weight: String(item.weight), contactPhone: item.contactPhone });
        setError("");
    }

    async function deletePet(id: number) {
        if (!window.confirm("Deseja realmente excluir este pet?")) return;
        setError("");

        try {
            const response = await fetch(`http://localhost:3001/api/auth/pets/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Não foi possível excluir o pet.");
            }
            setPets((current) => current.filter((item) => item.id !== id));
            if (editingPetId === id) {
                setEditingPetId(null);
                setPet(emptyPet);
            }
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Erro ao excluir o pet.");
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card minha-area-card">
                <h2>Olá, {name}! 🐾</h2>
                <p>Bem-vindo à sua área de tutor.</p>

                <section className="pets-section" aria-labelledby="pets-title">
                    <h3 id="pets-title">Meus Pets</h3>
                    <form className="pet-form" onSubmit={handleSubmit}>
                        <label>Raça<input value={pet.breed} onChange={(event) => updatePet("breed", event.target.value)} required /></label>
                        <label>Nome<input value={pet.name} onChange={(event) => updatePet("name", event.target.value)} required /></label>
                        <label>Idade (anos)<input type="number" min="0" value={pet.age} onChange={(event) => updatePet("age", event.target.value)} required /></label>
                        <label>Peso (kg)<input type="number" min="0.1" step="0.1" value={pet.weight} onChange={(event) => updatePet("weight", event.target.value)} required /></label>
                        <label>Telefone para contato<input type="tel" value={pet.contactPhone} onChange={(event) => updatePet("contactPhone", event.target.value)} required /></label>
                        <button type="submit" disabled={saving}>{saving ? "Salvando..." : editingPetId === null ? "Cadastrar pet" : "Salvar alterações"}</button>
                    </form>

                    {editingPetId !== null && <button className="cancel-edit-button" type="button" onClick={() => { setEditingPetId(null); setPet(emptyPet); }}>Cancelar edição</button>}

                    {error && <p className="auth-error">{error}</p>}
                    {loading && <p className="auth-hint">Carregando pets...</p>}
                    {!loading && pets.length === 0 && <p className="auth-hint">Nenhum pet cadastrado ainda.</p>}
                    {pets.length > 0 && <div className="pets-list">{pets.map((item) => <article className="pet-item" key={item.id}><div className="pet-item-heading"><strong>{item.name}</strong><div className="pet-actions"><button type="button" className="pet-action-button" aria-label={`Editar ${item.name}`} title={`Editar ${item.name}`} onClick={() => startEditing(item)}><Pencil size={16} /></button><button type="button" className="pet-action-button pet-action-button--delete" aria-label={`Excluir ${item.name}`} title={`Excluir ${item.name}`} onClick={() => void deletePet(item.id)}><Trash2 size={16} /></button></div></div><span>{item.breed} · {item.age} anos · {item.weight} kg</span><small>Contato: {item.contactPhone}</small></article>)}</div>}
                </section>

                <div className="minha-area-placeholder">
                    <p><strong>Próximos agendamentos</strong></p>
                    <p className="auth-hint">Nenhum agendamento encontrado.</p>
                </div>

                <button type="button" onClick={onLogout}>Sair</button>
            </div>
        </div>
    );
}