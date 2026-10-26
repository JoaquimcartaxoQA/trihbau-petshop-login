import { useState } from "react";
import { Menu, User, X } from "lucide-react";
import Logo from "./Logo";

interface HeaderProps {
  onOpenProducts: () => void;
  onOpenTutorArea: () => void;
  onBookingClick: () => void;
}

export default function Header({ onOpenProducts, onOpenTutorArea, onBookingClick }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="topbar">
      <a href="#inicio" className="topbar-brand">
        <Logo compact />
      </a>
      <nav className="desktop-nav" aria-label="Navegacao principal">
        <a href="#sobre">Sobre</a>
        <button type="button" onClick={onOpenProducts}>
          Produtos
        </button>
        <a href="#servicos">Servicos</a>
        <a href="#galeria">Galeria</a>
        <a href="#contato">Contato</a>
      </nav>
      <button className="nav-cta nav-cta--ghost" onClick={onOpenTutorArea}>
        <User size={16} /> Área do Tutor
      </button>
      <button className="nav-cta nav-cta--booking" onClick={onBookingClick}>
        Agendar agora
      </button>
      <button
        className="menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menu"
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X /> : <Menu />}
      </button>
      {menuOpen && (
        <nav className="mobile-nav">
          <a onClick={() => setMenuOpen(false)} href="#sobre">
            Sobre
          </a>
          <button
            onClick={() => {
              setMenuOpen(false);
              onOpenProducts();
            }}
          >
            Produtos
          </button>
          <a onClick={() => setMenuOpen(false)} href="#servicos">
            Servicos
          </a>
          <a onClick={() => setMenuOpen(false)} href="#galeria">
            Galeria
          </a>
          <a onClick={() => setMenuOpen(false)} href="#contato">
            Contato
          </a>
          <button
            onClick={() => {
              setMenuOpen(false);
              onOpenTutorArea();
            }}
          >
            Área do Tutor
          </button>
        </nav>
      )}
    </header>
  );
}
