import { Heart, ShieldCheck, Sparkles, Star } from "lucide-react";

export default function About() {
  return (
    <section id="sobre" className="section about-section">
      <div className="section-grid">
        <div className="section-intro reveal">
          <p className="eyebrow">Nosso jeito de cuidar</p>
          <h2>Carinho e experiencia de verdade.</h2>
        </div>
        <div className="about-copy reveal">
          <p className="lead">
            Ideal para tutores que buscam carinho, confianca e experiencia de verdade.
          </p>
          <p>
            A TrihbAU nasceu para transformar o banho em um ritual de bem-estar. Cada pet e recebido
            no seu tempo, com escuta atenta, produtos de alta qualidade e profissionais que entendem
            comportamento e tecnica.
          </p>
          <div className="values">
            <div>
              <Heart />
              <strong>Carinho</strong>
              <span>Cuidado individual, sempre.</span>
            </div>
            <div>
              <ShieldCheck />
              <strong>Confianca</strong>
              <span>Seguranca em cada etapa.</span>
            </div>
            <div>
              <Sparkles />
              <strong>Experiencia</strong>
              <span>Detalhes que fazem diferenca.</span>
            </div>
          </div>
        </div>
      </div>
      <div className="stats reveal" aria-label="Numeros da TrihbAU">
        <div>
          <strong>
            <span className="stat-number" data-value="787">
              787
            </span>
            +
          </strong>
          <p>pets atendidos com carinho</p>
        </div>
        <div>
          <strong>
            <span className="stat-number" data-value="4297">
              4297
            </span>
          </strong>
          <p>experiencias felizes</p>
        </div>
        <div className="stats-note">
          <Star fill="currentColor" />
          <p>A excelencia esta nos pequenos gestos.</p>
        </div>
      </div>
    </section>
  );
}
