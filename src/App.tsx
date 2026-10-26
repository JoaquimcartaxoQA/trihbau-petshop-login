import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate } from "animejs";
import Login from "./components/Login";
import Register from "./components/Register";
import MinhaArea from "./components/MinhaArea";
import Products from "./components/Products";
import Header from "./components/site/Header";
import Hero from "./components/site/Hero";
import About from "./components/site/About";
import Services from "./components/site/Services";
import Gallery from "./components/site/Gallery";
import Testimonials from "./components/site/Testimonials";
import Contact from "./components/site/Contact";
import Footer from "./components/site/Footer";
import { useAuth } from "./hooks/useAuth";
import { useSiteRoute } from "./hooks/useSiteRoute";
import { apiGet, type Pet } from "./services/api";
import { createAppointmentWhatsAppUrl, createWhatsAppUrl, type BookingPet } from "./utils/whatsapp";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const root = useRef<HTMLDivElement>(null);
  const {
    authView,
    tutorName,
    token,
    openLogin,
    openRegister,
    completeLogin,
    completeRegister,
    logout,
    ensureSessionForBooking,
  } = useAuth();
  const { siteView, openProducts, returnHome } = useSiteRoute();

  async function redirectToWhatsApp(authToken: string, name: string, pets?: BookingPet[]) {
    let tutorPets: BookingPet[] = pets ?? [];
    if (!pets) {
      try {
        tutorPets = await apiGet<Pet[]>(
          "/api/auth/pets",
          "Não foi possível carregar os pets.",
          authToken,
        );
      } catch {
        tutorPets = [];
      }
    }

    window.open(createWhatsAppUrl(name, tutorPets), "_blank", "noopener,noreferrer");
  }

  function handleBookingClick() {
    const session = ensureSessionForBooking();
    if (session) void redirectToWhatsApp(session.token, session.name);
  }

  function handleAuthSuccess(authToken: string, name: string) {
    if (completeLogin(authToken, name)) void redirectToWhatsApp(authToken, name);
  }

  useEffect(() => {
    if (!root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".hero-logo", { opacity: 0, y: 18, duration: 0.65 })
        .from(".hero-kicker", { opacity: 0, y: 22, duration: 0.55 }, "-=.3")
        .from(".hero-title span", { yPercent: 110, duration: 0.9, stagger: 0.12 }, "-=.3")
        .from(".hero-copy", { opacity: 0, y: 22, duration: 0.7 }, "-=.42")
        .from(".hero-actions", { opacity: 0, y: 18, duration: 0.6 }, "-=.4");
      gsap.to(".hero-media", {
        yPercent: 12,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.8 },
      });
      gsap.utils
        .toArray<HTMLElement>(".reveal")
        .forEach((el) =>
          gsap.from(el, {
            opacity: 0,
            y: 42,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 87%", once: true },
          }),
        );
      gsap.utils.toArray<HTMLElement>(".stat-number").forEach((el) => {
        const state = { value: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () =>
            animate(state, {
              value: Number(el.dataset.value),
              duration: 1800,
              ease: "outExpo",
              onUpdate: () => {
                el.textContent = Math.round(state.value).toLocaleString("pt-BR");
              },
            }),
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  if (authView === "login") {
    return <Login onSuccess={handleAuthSuccess} onGoToRegister={openRegister} />;
  }
  if (authView === "register") {
    return <Register onSuccess={completeRegister} onGoToLogin={openLogin} />;
  }
  if (authView === "minha-area") {
    return (
      <MinhaArea
        name={tutorName}
        token={token ?? ""}
        onSchedule={(appointment) =>
          window.open(
            createAppointmentWhatsAppUrl(tutorName, appointment),
            "_blank",
            "noopener,noreferrer",
          )
        }
        onLogout={logout}
      />
    );
  }

  if (siteView === "products") {
    return <Products onBack={returnHome} />;
  }

  return (
    <div ref={root} className="site-shell">
      <Header
        onOpenProducts={openProducts}
        onOpenTutorArea={openLogin}
        onBookingClick={handleBookingClick}
      />
      <main>
        <Hero onBookingClick={handleBookingClick} />
        <About />
        <Services />
        <Gallery />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
