import { MessageCircle } from "lucide-react";
import Logo from "./Logo";
import { WHATSAPP_URL } from "../../utils/whatsapp";

export default function Footer() {
  return (
    <>
      <footer>
        <Logo compact />
        <p>Pet care boutique em Fortaleza.</p>
        <div>
          <a href="https://instagram.com/trihbaupetshop" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </div>
        <small>© {new Date().getFullYear()} TrihbAU PetShop. Todos os direitos reservados.</small>
      </footer>
      <a
        className="whatsapp-float"
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Conversar pelo WhatsApp"
      >
        <MessageCircle />
      </a>
    </>
  );
}
