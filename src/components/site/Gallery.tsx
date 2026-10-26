import { Camera } from "lucide-react";

const gallery = [
  {
    src: "https://images.pexels.com/photos/19145895/pexels-photo-19145895.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Pet recebendo um banho cuidadoso",
    wide: true,
  },
  {
    src: "https://images.pexels.com/photos/15128311/pexels-photo-15128311.jpeg?auto=compress&cs=tinysrgb&w=800",
    alt: "Yorkshire bem cuidado com laco",
    wide: false,
  },
  {
    src: "https://images.pexels.com/photos/19145879/pexels-photo-19145879.jpeg?auto=compress&cs=tinysrgb&w=1000",
    alt: "Escovacao profissional em cachorro",
    wide: false,
  },
  {
    src: "https://images.pexels.com/photos/20137753/pexels-photo-20137753.jpeg?auto=compress&cs=tinysrgb&w=800",
    alt: "Chow chow limpo e feliz",
    wide: false,
  },
  {
    src: "https://images.pexels.com/photos/19145884/pexels-photo-19145884.jpeg?auto=compress&cs=tinysrgb&w=1000",
    alt: "Tosa profissional em shih tzu",
    wide: true,
  },
];

export default function Gallery() {
  return (
    <section id="galeria" className="section gallery-section">
      <div className="gallery-heading reveal">
        <div>
          <p className="eyebrow">Momentos de cuidado</p>
          <h2>
            Bonitos por fora.
            <br />
            Felizes por inteiro.
          </h2>
        </div>
        <a href="https://instagram.com/trihbaupetshop" target="_blank" rel="noreferrer">
          <Camera /> @trihbaupetshop
        </a>
      </div>
      <div className="gallery-grid reveal">
        {gallery.map((image, index) => (
          <figure className={image.wide ? "gallery-wide" : ""} key={image.src}>
            <img src={image.src} alt={image.alt} loading={index > 1 ? "lazy" : "eager"} />
            <figcaption>
              <span>TrihbAU care</span>
              <Camera size={18} />
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
