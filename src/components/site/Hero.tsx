import { MessageCircle, Sparkles } from "lucide-react";
import Logo from "./Logo";

interface HeroProps {
  onBookingClick: () => void;
}

export default function Hero({ onBookingClick }: HeroProps) {
  return (
    <section id="inicio" className="hero">
      <img
        className="hero-media"
        src="https://images.pexels.com/photos/19145897/pexels-photo-19145897.jpeg?auto=compress&cs=tinysrgb&w=1800"
        alt="Profissional dando banho cuidadoso em um pet"
        fetchPriority="high"
      />
      <div className="hero-shade" />
      <div className="hero-content">
        <div className="hero-logo">
          <Logo />
        </div>
        <p className="hero-kicker">
          <Sparkles size={15} /> Pet care boutique em Fortaleza
        </p>
        <h1 className="hero-title">
          <span>Banho premium</span>
          <span>para pets exigentes.</span>
        </h1>
        <p className="hero-copy">
          Cuidado gentil, tecnica e uma experiencia tranquila para quem faz parte da sua familia.
        </p>
        <div className="hero-actions">
          <button onClick={onBookingClick} className="button button-primary">
            <MessageCircle size={18} /> Agende seu horario
          </button>
          <a href="#servicos" className="button button-ghost">
            Conheca a experiencia
          </a>
        </div>
      </div>
      <a className="scroll-cue" href="#sobre">
        <span /> Descubra
      </a>
    </section>
  );
}
