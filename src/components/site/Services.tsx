import { useEffect, useRef } from "react";
import {
  Bath,
  ChevronRight,
  Gift,
  Home,
  Scissors,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { animate, createScope, spring } from "animejs";

interface ServiceEntry {
  icon: LucideIcon;
  title: string;
  text: string;
}

const services: ServiceEntry[] = [
  {
    icon: Home,
    title: "Casinha",
    text: "Um ambiente seguro, higienizado e acolhedor, pensado para o bem-estar.",
  },
  {
    icon: ShoppingBag,
    title: "Produtos",
    text: "Cosmeticos e cuidados premium selecionados para cada tipo de pelagem.",
  },
  {
    icon: Bath,
    title: "Cuidados",
    text: "Banho relaxante, hidratacao, higiene e finalizacao com delicadeza.",
  },
  {
    icon: Scissors,
    title: "Tosas",
    text: "Styling personalizado que respeita a raca, o pelo e a personalidade.",
  },
  {
    icon: Gift,
    title: "Datas especiais",
    text: "Experiencias tematicas e producoes delicadas para celebrar seu pet.",
  },
];

export default function Services() {
  const root = useRef<HTMLElement>(null);
  const serviceScope = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    serviceScope.current = createScope({ root }).add((self) => {
      self!.add("serviceIn", (target: HTMLElement) => {
        const icon = target.querySelector(".service-icon");
        if (icon)
          animate(icon, {
            scale: [
              { to: 1.12, duration: 180 },
              { to: 1, ease: spring({ bounce: 0.35 }) },
            ],
            rotate: [{ to: -4 }, { to: 0 }],
          });
      });
      self!.add("serviceOut", (target: HTMLElement) => {
        const icon = target.querySelector(".service-icon");
        if (icon) animate(icon, { scale: 1, rotate: 0, duration: 250, ease: "outExpo" });
      });
    });
    return () => {
      serviceScope.current?.revert();
      serviceScope.current = null;
    };
  }, []);

  return (
    <section id="servicos" className="section services-section">
      <div className="center-heading reveal">
        <p className="eyebrow">Experiencia TrihbAU</p>
        <h2>Um ritual completo de bem-estar.</h2>
        <p>Do ambiente a finalizacao, tudo foi pensado para o conforto do seu pet.</p>
      </div>
      <div className="services-list reveal">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <article
              className="service-item"
              key={service.title}
              onMouseEnter={(e) => serviceScope.current?.methods.serviceIn(e.currentTarget)}
              onMouseLeave={(e) => serviceScope.current?.methods.serviceOut(e.currentTarget)}
            >
              <span className="service-index">0{index + 1}</span>
              <span className="service-icon">
                <Icon />
              </span>
              <div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </div>
              <ChevronRight className="service-arrow" />
            </article>
          );
        })}
      </div>
    </section>
  );
}
