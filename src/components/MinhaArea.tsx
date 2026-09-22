import { useEffect, useState } from "react";
import { MessageCircle, Pencil, Trash2 } from "lucide-react";

interface MinhaAreaProps {
  name: string;
  token: string;
  onSchedule: (appointment: Pick<Appointment, "date" | "slotStart" | "service" | "petName" | "petBreed">) => void;
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

interface BookingSlot {
  start: string;
  capacity: number;
  booked: number;
  available: number;
}

interface Appointment {
  id: number;
  date: string;
  slotStart: string;
  service: string;
  petId: number;
  petName: string;
  petBreed: string;
}

const bookingServices = [
  "Banho",
  "Tosa completa",
  "Tosa higiênica",
  "Limpeza de ouvidos",
  "Corte de unhas",
  "Hidratação premium",
];

const emptyPet = { breed: "", name: "", age: "", weight: "", contactPhone: "" };

function getNextWeekday() {
  const date = new Date();
  while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export default function MinhaArea({ name, token, onSchedule, onLogout }: MinhaAreaProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [pet, setPet] = useState(emptyPet);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPetId, setEditingPetId] = useState<number | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState(getNextWeekday);
  const [bookingSlots, setBookingSlots] = useState<BookingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedPetId, setSelectedPetId] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null);

  useEffect(() => {
    async function loadPets() {
      try {
        const response = await fetch("http://localhost:3001/api/auth/pets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Não foi possível carregar os pets.");
        setPets(await response.json());
      } catch (requestError) {
        setError(
          requestError instanceof Error ? requestError.message : "Erro ao carregar os pets.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadPets();
  }, [token]);

  useEffect(() => {
    async function loadAppointments() {
      try {
        const response = await fetch("http://localhost:3001/api/auth/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Não foi possível carregar os agendamentos.");
        setAppointments(await response.json());
      } catch (requestError) {
        setError(
          requestError instanceof Error ? requestError.message : "Erro ao carregar agendamentos.",
        );
      } finally {
        setAppointmentsLoading(false);
      }
    }

    void loadAppointments();
  }, [token]);

  useEffect(() => {
    async function loadAvailability() {
      const weekday = new Date(`${bookingDate}T12:00:00`).getDay();
      if (weekday === 0 || weekday === 6) {
        setBookingSlots([]);
        setSelectedSlot("");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3001/api/auth/appointments/availability?date=${bookingDate}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!response.ok) throw new Error("Não foi possível carregar as vagas.");
        setBookingSlots(await response.json());
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Erro ao carregar vagas.");
      }
    }

    void loadAvailability();
  }, [bookingDate, token]);

  function updatePet(field: keyof typeof emptyPet, value: string) {
    setPet((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const isEditing = editingPetId !== null;
      const response = await fetch(
        `http://localhost:3001/api/auth/pets${isEditing ? `/${editingPetId}` : ""}`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...pet, age: Number(pet.age), weight: Number(pet.weight) }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível salvar o pet.");
      setPets((current) => {
        const updated = isEditing
          ? current.map((item) => (item.id === data.id ? data : item))
          : [...current, data];
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
    setPet({
      breed: item.breed,
      name: item.name,
      age: String(item.age),
      weight: String(item.weight),
      contactPhone: item.contactPhone,
    });
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

  async function handleAppointmentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPetId || !selectedSlot) return;
    setError("");
    setBookingLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/auth/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          petId: Number(selectedPetId),
          date: bookingDate,
          slotStart: selectedSlot,
          services: selectedServices,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível reservar este horário.");
      const selectedPet = pets.find((item) => item.id === Number(selectedPetId));
      if (selectedPet) {
        setAppointments((current) =>
          [
            ...current,
            {
              id: data.id,
              date: data.date,
              slotStart: data.slotStart,
              service: data.service,
              petId: selectedPet.id,
              petName: selectedPet.name,
              petBreed: selectedPet.breed,
            },
          ].sort((left, right) =>
            `${left.date}${left.slotStart}`.localeCompare(`${right.date}${right.slotStart}`),
          ),
        );
      }
      setSelectedSlot("");
      setSelectedServices([]);
      setServiceModalOpen(false);
      const availabilityResponse = await fetch(
        `http://localhost:3001/api/auth/appointments/availability?date=${bookingDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (availabilityResponse.ok) setBookingSlots(await availabilityResponse.json());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Erro ao reservar horário.");
    } finally {
      setBookingLoading(false);
    }
  }

  function openServiceModal(slotStart: string) {
    setEditingAppointmentId(null);
    setSelectedSlot(slotStart);
    setSelectedServices([]);
    setServiceModalOpen(true);
  }

  function editAppointment(item: Appointment) {
    setEditingAppointmentId(item.id);
    setSelectedSlot(item.slotStart);
    setSelectedServices(item.service.split(", "));
    setServiceModalOpen(true);
  }

  async function deleteAppointment(id: number) {
    if (!window.confirm("Deseja realmente excluir este agendamento?")) return;
    setError("");

    try {
      const response = await fetch(`http://localhost:3001/api/auth/appointments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Não foi possível excluir o agendamento.");
      }
      setAppointments((current) => current.filter((item) => item.id !== id));
      const availabilityResponse = await fetch(
        `http://localhost:3001/api/auth/appointments/availability?date=${bookingDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (availabilityResponse.ok) setBookingSlots(await availabilityResponse.json());
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Erro ao excluir agendamento.",
      );
    }
  }

  function toggleService(service: string) {
    setSelectedServices((current) => {
      if (current.includes(service)) return current.filter((item) => item !== service);
      if (service === "Tosa completa")
        return [...current.filter((item) => item !== "Tosa higiênica"), service];
      if (service === "Tosa higiênica" && current.includes("Tosa completa")) return current;
      return [...current, service];
    });
  }

  async function confirmServices() {
    if (selectedServices.length === 0) return;
    if (editingAppointmentId === null) {
      setServiceModalOpen(false);
      return;
    }

    setError("");
    setBookingLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/auth/appointments/${editingAppointmentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ services: selectedServices }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível editar o agendamento.");
      setAppointments((current) =>
        current.map((item) =>
          item.id === editingAppointmentId ? { ...item, service: data.service } : item,
        ),
      );
      setEditingAppointmentId(null);
      setServiceModalOpen(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Erro ao editar agendamento.",
      );
    } finally {
      setBookingLoading(false);
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
            <label>
              Raça
              <input
                value={pet.breed}
                onChange={(event) => updatePet("breed", event.target.value)}
                required
              />
            </label>
            <label>
              Nome
              <input
                value={pet.name}
                onChange={(event) => updatePet("name", event.target.value)}
                required
              />
            </label>
            <label>
              Idade (anos)
              <input
                type="number"
                min="0"
                value={pet.age}
                onChange={(event) => updatePet("age", event.target.value)}
                required
              />
            </label>
            <label>
              Peso (kg)
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={pet.weight}
                onChange={(event) => updatePet("weight", event.target.value)}
                required
              />
            </label>
            <label>
              Telefone para contato
              <input
                type="tel"
                value={pet.contactPhone}
                onChange={(event) => updatePet("contactPhone", event.target.value)}
                required
              />
            </label>
            <button type="submit" disabled={saving}>
              {saving
                ? "Salvando..."
                : editingPetId === null
                  ? "Cadastrar pet"
                  : "Salvar alterações"}
            </button>
          </form>

          {editingPetId !== null && (
            <button
              className="cancel-edit-button"
              type="button"
              onClick={() => {
                setEditingPetId(null);
                setPet(emptyPet);
              }}
            >
              Cancelar edição
            </button>
          )}

          {error && <p className="auth-error">{error}</p>}
          {loading && <p className="auth-hint">Carregando pets...</p>}
          {!loading && pets.length === 0 && (
            <p className="auth-hint">Nenhum pet cadastrado ainda.</p>
          )}
          {pets.length > 0 && (
            <div className="pets-list">
              {pets.map((item) => (
                <article className="pet-item" key={item.id}>
                  <div className="pet-item-heading">
                    <strong>{item.name}</strong>
                    <div className="pet-actions">
                      <button
                        type="button"
                        className="pet-action-button"
                        aria-label={`Editar ${item.name}`}
                        title={`Editar ${item.name}`}
                        onClick={() => startEditing(item)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="pet-action-button pet-action-button--delete"
                        aria-label={`Excluir ${item.name}`}
                        title={`Excluir ${item.name}`}
                        onClick={() => void deletePet(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <span>
                    {item.breed} · {item.age} anos · {item.weight} kg
                  </span>
                  <small>Contato: {item.contactPhone}</small>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="minha-area-placeholder">
          <p>
            <strong>Próximos agendamentos</strong>
          </p>
          <form className="appointment-form" onSubmit={handleAppointmentSubmit}>
            <label>
              Pet
              <select
                value={selectedPetId}
                onChange={(event) => setSelectedPetId(event.target.value)}
                required
              >
                <option value="">Selecione um pet</option>
                {pets.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {item.breed}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Data
              <input
                type="date"
                value={bookingDate}
                min={getNextWeekday()}
                onChange={(event) => {
                  setBookingDate(event.target.value);
                  setSelectedSlot("");
                }}
                required
              />
            </label>
            <p className="appointment-hours">
              Segunda a sexta, das 8h às 18h. Cada horário dura 1h30.
            </p>
            <div className="booking-slots" aria-label="Vagas disponíveis">
              {bookingSlots.map((slot) => (
                <button
                  key={slot.start}
                  type="button"
                  className={`booking-slot ${selectedSlot === slot.start ? "booking-slot--selected" : ""}`}
                  disabled={slot.available === 0}
                  onClick={() => openServiceModal(slot.start)}
                >
                  <strong>{slot.start}</strong>
                  <span>
                    {slot.available} {slot.available === 1 ? "vaga" : "vagas"}
                  </span>
                </button>
              ))}
            </div>
            {bookingSlots.length === 0 && (
              <p className="auth-hint">Escolha um dia útil para ver as vagas.</p>
            )}
            <button
              className="appointment-submit"
              type="submit"
              disabled={
                bookingLoading || !selectedPetId || !selectedSlot || selectedServices.length === 0
              }
            >
              {bookingLoading ? "Reservando..." : "Confirmar agendamento"}
            </button>
          </form>
          {appointments.length === 0 && <p className="auth-hint">Nenhum agendamento encontrado.</p>}
          {appointments.length > 0 && (
            <div className="appointments-list">
              {appointments.map((item) => (
                <article className="appointment-item" key={item.id}>
                  <div className="appointment-item-heading">
                    <strong>
                      {item.date.split("-").reverse().join("/")} às {item.slotStart}
                    </strong>
                    <div className="appointment-actions">
                      <button
                        type="button"
                        className="pet-action-button"
                        aria-label={`Editar agendamento de ${item.petName}`}
                        title="Editar serviços"
                        onClick={() => editAppointment(item)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="pet-action-button pet-action-button--delete"
                        aria-label={`Excluir agendamento de ${item.petName}`}
                        title="Excluir agendamento"
                        onClick={() => void deleteAppointment(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <span>
                    {item.petName} - {item.petBreed}
                  </span>
                  <small>{item.service}</small>
                </article>
              ))}
            </div>
          )}
        </div>

        {serviceModalOpen && (
          <div
            className="service-modal-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setServiceModalOpen(false);
            }}
          >
            <section
              className="service-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="service-modal-title"
            >
              <div className="service-modal-header">
                <div>
                  <p className="eyebrow">
                    {editingAppointmentId === null
                      ? `Horário das ${selectedSlot}`
                      : "Editar agendamento"}
                  </p>
                  <h3 id="service-modal-title">Escolha os serviços</h3>
                </div>
                <button
                  type="button"
                  className="service-modal-close"
                  aria-label="Fechar seleção de serviços"
                  onClick={() => setServiceModalOpen(false)}
                >
                  ×
                </button>
              </div>
              <div className="service-options">
                {bookingServices.map((service) => {
                  const isDisabled =
                    service === "Tosa higiênica" && selectedServices.includes("Tosa completa");
                  return (
                    <label
                      className={`service-option ${isDisabled ? "service-option--disabled" : ""}`}
                      key={service}
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service)}
                        disabled={isDisabled}
                        onChange={() => toggleService(service)}
                      />
                      <span>{service}</span>
                    </label>
                  );
                })}
              </div>
              <p className="auth-hint">
                Tosa completa e Tosa higiênica não podem ser selecionadas juntas.
              </p>
              <button
                type="button"
                className="appointment-submit"
                disabled={bookingLoading || selectedServices.length === 0}
                onClick={() => void confirmServices()}
              >
                {bookingLoading
                  ? "Salvando..."
                  : editingAppointmentId === null
                    ? "Usar serviços selecionados"
                    : "Salvar alterações"}
              </button>
            </section>
          </div>
        )}

        <button
          className="schedule-button"
          type="button"
          disabled={appointmentsLoading || pets.length === 0 || appointments.length === 0}
          onClick={() => onSchedule(appointments[appointments.length - 1])}
        >
          <MessageCircle size={17} /> Agendar pelo WhatsApp
        </button>
        <button type="button" onClick={onLogout}>
          Sair
        </button>
      </div>
    </div>
  );
}
