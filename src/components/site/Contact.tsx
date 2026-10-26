import { Camera, Clock3, MapPin, MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "../../utils/whatsapp";

export default function Contact() {
  return (
    <section id="contato" className="section contact-section">
      <div className="contact-content reveal">
        <p className="eyebrow">Venha nos conhecer</p>
        <h2>Seu pet merece esse cuidado.</h2>
        <p>Estamos no Monte Castelo, em Fortaleza. Fale com a nossa equipe e reserve um horario.</p>
        <div className="contact-lines">
          <a
            href="https://maps.google.com/?q=Rua+Conrado+Cabral+664B+Fortaleza"
            target="_blank"
            rel="noreferrer"
          >
            <MapPin />
            <span>
              <small>Endereco</small>
              Rua Conrado Cabral, 664B
              <br />
              Monte Castelo, Fortaleza - CE
            </span>
          </a>
          <div>
            <Clock3 />
            <span>
              <small>Funcionamento</small>
              Segunda a sabado, 8h as 18h
            </span>
          </div>
          <a href="https://instagram.com/trihbaupetshop" target="_blank" rel="noreferrer">
            <Camera />
            <span>
              <small>Instagram</small>
              @trihbaupetshop
            </span>
          </a>
        </div>
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="button button-primary">
          <MessageCircle size={18} /> Fale conosco no WhatsApp
        </a>
      </div>
      <div className="map-wrap reveal">
        <iframe
          title="Mapa da TrihbAU PetShop"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps?q=Rua%20Conrado%20Cabral%2C%20664B%20-%20Monte%20Castelo%2C%20Fortaleza&output=embed"
        />
      </div>
    </section>
  );
}
