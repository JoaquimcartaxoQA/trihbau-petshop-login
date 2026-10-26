import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    text: "Atendimento impecavel. Minha Luna voltou cheirosa, tranquila e linda. Da para sentir o carinho em cada detalhe.",
    name: "Mariana A.",
    pet: "tutora da Luna",
  },
  {
    text: "Foi o primeiro banho em que o Bento nao voltou estressado. Equipe cuidadosa, ambiente lindo e muita confianca.",
    name: "Camila R.",
    pet: "tutora do Bento",
  },
  {
    text: "A tosa ficou exatamente como pedi. Hoje a TrihbAU e o nosso lugar de confianca em Fortaleza.",
    name: "Rafael M.",
    pet: "tutor do Theo",
  },
];

export default function Testimonials() {
  const [testimonial, setTestimonial] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setTestimonial((current) => (current + 1) % testimonials.length),
      6500,
    );
    return () => window.clearInterval(timer);
  }, []);

  const move = (direction: number) =>
    setTestimonial((current) => (current + direction + testimonials.length) % testimonials.length);

  return (
    <section className="testimonial-section">
      <div className="testimonial-inner reveal">
        <div className="quote-mark">"</div>
        <div className="stars" aria-label="5 estrelas">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} fill="currentColor" />
          ))}
        </div>
        <blockquote key={testimonial}>{testimonials[testimonial].text}</blockquote>
        <p>
          <strong>{testimonials[testimonial].name}</strong> / {testimonials[testimonial].pet}
        </p>
        <div className="carousel-controls">
          <button onClick={() => move(-1)} aria-label="Depoimento anterior">
            <ChevronLeft />
          </button>
          <span>
            {testimonial + 1} / {testimonials.length}
          </span>
          <button onClick={() => move(1)} aria-label="Proximo depoimento">
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}
