import logoImg from "./assets/logo.png";
import { useEffect, useRef, useState } from "react";
import { Bath, Camera, ChevronLeft, ChevronRight, Clock3, Gift, Heart, Home, MapPin, Menu, MessageCircle, Scissors, ShieldCheck, ShoppingBag, Sparkles, Star, X, User } from "lucide-react";
import { animate, createScope, spring } from "animejs";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Login from "./components/Login";
import Register from "./components/Register";
import MinhaArea from "./components/MinhaArea";

gsap.registerPlugin(ScrollTrigger);
const WHATSAPP = "https://wa.me/5585997339952?text=Ola%2C%20quero%20agendar%20um%20horario%20na%20TrihbAU";

const gallery = [
  { src: "https://images.pexels.com/photos/19145895/pexels-photo-19145895.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Pet recebendo um banho cuidadoso", wide: true },
  { src: "https://images.pexels.com/photos/15128311/pexels-photo-15128311.jpeg?auto=compress&cs=tinysrgb&w=800", alt: "Yorkshire bem cuidado com laco" },
  { src: "https://images.pexels.com/photos/19145879/pexels-photo-19145879.jpeg?auto=compress&cs=tinysrgb&w=1000", alt: "Escovacao profissional em cachorro" },
  { src: "https://images.pexels.com/photos/20137753/pexels-photo-20137753.jpeg?auto=compress&cs=tinysrgb&w=800", alt: "Chow chow limpo e feliz" },
  { src: "https://images.pexels.com/photos/19145884/pexels-photo-19145884.jpeg?auto=compress&cs=tinysrgb&w=1000", alt: "Tosa profissional em shih tzu", wide: true },
];
const testimonials = [
  { text: "Atendimento impecavel. Minha Luna voltou cheirosa, tranquila e linda. Da para sentir o carinho em cada detalhe.", name: "Mariana A.", pet: "tutora da Luna" },
  { text: "Foi o primeiro banho em que o Bento nao voltou estressado. Equipe cuidadosa, ambiente lindo e muita confianca.", name: "Camila R.", pet: "tutora do Bento" },
  { text: "A tosa ficou exatamente como pedi. Hoje a TrihbAU e o nosso lugar de confianca em Fortaleza.", name: "Rafael M.", pet: "tutor do Theo" },
];
const services = [
  { icon: Home, title: "Casinha", text: "Um ambiente seguro, higienizado e acolhedor, pensado para o bem-estar." },
  { icon: ShoppingBag, title: "Produtos", text: "Cosmeticos e cuidados premium selecionados para cada tipo de pelagem." },
  { icon: Bath, title: "Cuidados", text: "Banho relaxante, hidratacao, higiene e finalizacao com delicadeza." },
  { icon: Scissors, title: "Tosas", text: "Styling personalizado que respeita a raca, o pelo e a personalidade." },
  { icon: Gift, title: "Datas especiais", text: "Experiencias tematicas e producoes delicadas para celebrar seu pet." },
];

function Logo({ compact = false }: { compact?: boolean }){
  return <div className="brand-lockup" aria-label="TrihbAU PetShop">
    <span className={`logo-mark ${compact ? "logo-mark--small" : ""}`}>
      <img src={logoImg} alt="TrihbAU PetShop" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    </span>
    <span className="brand-name">Trihb<span>AU</span></span>{!compact && <span className="brand-sub">PETSHOP</span>}
  </div>;
}

export default function App() {
  const root = useRef<HTMLDivElement>(null);
  const animeScope = useRef<ReturnType<typeof createScope> | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [testimonial, setTestimonial] = useState(0);

  // ===== NOVO: estado da área de login =====
  const [authView, setAuthView] = useState<"site" | "login" | "register" | "minha-area">("site");
  const [tutorName, setTutorName] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedName = localStorage.getItem("tutorName");
    if (savedToken && savedName) {
      setTutorName(savedName);
      setAuthView("minha-area");
    }
  }, []);

  function handleAuthSuccess(token: string, name: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("tutorName", name);
    setTutorName(name);
    setAuthView("minha-area");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("tutorName");
    setTutorName("");
    setAuthView("site");
  }
  // ===== FIM DO NOVO =====

  useEffect(() => { const timer = window.setInterval(() => setTestimonial((c) => (c + 1) % testimonials.length), 6500); return () => window.clearInterval(timer); }, []);
  useEffect(() => {
    if (!root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: "power3.out" } }).from(".hero-logo", { opacity: 0, y: 18, duration: .65 }).from(".hero-kicker", { opacity: 0, y: 22, duration: .55 }, "-=.3").from(".hero-title span", { yPercent: 110, duration: .9, stagger: .12 }, "-=.3").from(".hero-copy", { opacity: 0, y: 22, duration: .7 }, "-=.42").from(".hero-actions", { opacity: 0, y: 18, duration: .6 }, "-=.4");
      gsap.to(".hero-media", { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .8 } });
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => gsap.from(el, { opacity: 0, y: 42, duration: .9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 87%", once: true } }));
      gsap.utils.toArray<HTMLElement>(".stat-number").forEach((el) => { const state = { value: 0 }; ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => animate(state, { value: Number(el.dataset.value), duration: 1800, ease: "outExpo", onUpdate: () => { el.textContent = Math.round(state.value).toLocaleString("pt-BR"); } }) }); });
    }, root);
    animeScope.current = createScope({ root }).add((self) => {
      self!.add("serviceIn", (target: HTMLElement) => { const icon = target.querySelector(".service-icon"); if (icon) animate(icon, { scale: [{ to: 1.12, duration: 180 }, { to: 1, ease: spring({ bounce: .35 }) }], rotate: [{ to: -4 }, { to: 0 }] }); });
      self!.add("serviceOut", (target: HTMLElement) => { const icon = target.querySelector(".service-icon"); if (icon) animate(icon, { scale: 1, rotate: 0, duration: 250, ease: "outExpo" }); });
    });
    return () => { ctx.revert(); animeScope.current?.revert(); };
  }, []);

  const moveTestimonial = (direction: number) => setTestimonial((c) => (c + direction + testimonials.length) % testimonials.length);

  // ===== NOVO: se estiver numa tela de autenticação, mostra só ela =====
  if (authView === "login") {
    return <Login onSuccess={handleAuthSuccess} onGoToRegister={() => setAuthView("register")} />;
  }
  if (authView === "register") {
    return <Register onSuccess={handleAuthSuccess} onGoToLogin={() => setAuthView("login")} />;
  }
  if (authView === "minha-area") {
    return <MinhaArea name={tutorName} onLogout={handleLogout} />;
  }
  // ===== FIM DO NOVO =====

  return <div ref={root} className="site-shell">
    <header className="topbar"><a href="#inicio" className="topbar-brand"><Logo compact/></a><nav className="desktop-nav" aria-label="Navegacao principal"><a href="#sobre">Sobre</a><a href="#servicos">Servicos</a><a href="#galeria">Galeria</a><a href="#contato">Contato</a></nav><button className="nav-cta nav-cta--ghost" onClick={() => setAuthView("login")}><User size={16}/> Área do Tutor</button><a className="nav-cta" href={WHATSAPP} target="_blank" rel="noreferrer">Agendar agora</a><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu" aria-expanded={menuOpen}>{menuOpen ? <X/> : <Menu/>}</button>{menuOpen && <nav className="mobile-nav"><a onClick={() => setMenuOpen(false)} href="#sobre">Sobre</a><a onClick={() => setMenuOpen(false)} href="#servicos">Servicos</a><a onClick={() => setMenuOpen(false)} href="#galeria">Galeria</a><a onClick={() => setMenuOpen(false)} href="#contato">Contato</a><button onClick={() => { setMenuOpen(false); setAuthView("login"); }}>Área do Tutor</button></nav>}</header>
    <main>
      <section id="inicio" className="hero"><img className="hero-media" src="https://images.pexels.com/photos/19145897/pexels-photo-19145897.jpeg?auto=compress&cs=tinysrgb&w=1800" alt="Profissional dando banho cuidadoso em um pet" fetchPriority="high"/><div className="hero-shade"/><div className="hero-content"><div className="hero-logo"><Logo/></div><p className="hero-kicker"><Sparkles size={15}/> Pet care boutique em Fortaleza</p><h1 className="hero-title"><span>Banho premium</span><span>para pets exigentes.</span></h1><p className="hero-copy">Cuidado gentil, tecnica e uma experiencia tranquila para quem faz parte da sua familia.</p><div className="hero-actions"><a href={WHATSAPP} target="_blank" rel="noreferrer" className="button button-primary"><MessageCircle size={18}/> Agende seu horario</a><a href="#servicos" className="button button-ghost">Conheca a experiencia</a></div></div><a className="scroll-cue" href="#sobre"><span/> Descubra</a></section>
      <section id="sobre" className="section about-section"><div className="section-grid"><div className="section-intro reveal"><p className="eyebrow">Nosso jeito de cuidar</p><h2>Carinho e experiencia de verdade.</h2></div><div className="about-copy reveal"><p className="lead">Ideal para tutores que buscam carinho, confianca e experiencia de verdade.</p><p>A TrihbAU nasceu para transformar o banho em um ritual de bem-estar. Cada pet e recebido no seu tempo, com escuta atenta, produtos de alta qualidade e profissionais que entendem comportamento e tecnica.</p><div className="values"><div><Heart/><strong>Carinho</strong><span>Cuidado individual, sempre.</span></div><div><ShieldCheck/><strong>Confianca</strong><span>Seguranca em cada etapa.</span></div><div><Sparkles/><strong>Experiencia</strong><span>Detalhes que fazem diferenca.</span></div></div></div></div><div className="stats reveal" aria-label="Numeros da TrihbAU"><div><strong><span className="stat-number" data-value="787">0</span>+</strong><p>pets atendidos com carinho</p></div><div><strong><span className="stat-number" data-value="4297">0</span></strong><p>experiencias felizes</p></div><div className="stats-note"><Star fill="currentColor"/><p>A excelencia esta nos pequenos gestos.</p></div></div></section>
      <section id="servicos" className="section services-section"><div className="center-heading reveal"><p className="eyebrow">Experiencia TrihbAU</p><h2>Um ritual completo de bem-estar.</h2><p>Do ambiente a finalizacao, tudo foi pensado para o conforto do seu pet.</p></div><div className="services-list reveal">{services.map((service,index) => { const Icon=service.icon; return <article className="service-item" key={service.title} onMouseEnter={(e)=>animeScope.current?.methods.serviceIn(e.currentTarget)} onMouseLeave={(e)=>animeScope.current?.methods.serviceOut(e.currentTarget)}><span className="service-index">0{index+1}</span><span className="service-icon"><Icon/></span><div><h3>{service.title}</h3><p>{service.text}</p></div><ChevronRight className="service-arrow"/></article>; })}</div></section>
      <section id="galeria" className="section gallery-section"><div className="gallery-heading reveal"><div><p className="eyebrow">Momentos de cuidado</p><h2>Bonitos por fora.<br/>Felizes por inteiro.</h2></div><a href="https://instagram.com/trihbaupetshop" target="_blank" rel="noreferrer"><Camera/> @trihbaupetshop</a></div><div className="gallery-grid reveal">{gallery.map((image,index)=><figure className={image.wide ? "gallery-wide":""} key={image.src}><img src={image.src} alt={image.alt} loading={index>1?"lazy":"eager"}/><figcaption><span>TrihbAU care</span><Camera size={18}/></figcaption></figure>)}</div></section>
      <section className="testimonial-section"><div className="testimonial-inner reveal"><div className="quote-mark">"</div><div className="stars" aria-label="5 estrelas">{Array.from({length:5}).map((_,i)=><Star key={i} fill="currentColor"/>)}</div><blockquote key={testimonial}>{testimonials[testimonial].text}</blockquote><p><strong>{testimonials[testimonial].name}</strong> / {testimonials[testimonial].pet}</p><div className="carousel-controls"><button onClick={()=>moveTestimonial(-1)} aria-label="Depoimento anterior"><ChevronLeft/></button><span>{testimonial+1} / {testimonials.length}</span><button onClick={()=>moveTestimonial(1)} aria-label="Proximo depoimento"><ChevronRight/></button></div></div></section>
      <section id="contato" className="section contact-section"><div className="contact-content reveal"><p className="eyebrow">Venha nos conhecer</p><h2>Seu pet merece esse cuidado.</h2><p>Estamos no Monte Castelo, em Fortaleza. Fale com a nossa equipe e reserve um horario.</p><div className="contact-lines"><a href="https://maps.google.com/?q=Rua+Conrado+Cabral+664B+Fortaleza" target="_blank" rel="noreferrer"><MapPin/><span><small>Endereco</small>Rua Conrado Cabral, 664B<br/>Monte Castelo, Fortaleza - CE</span></a><div><Clock3/><span><small>Funcionamento</small>Segunda a sabado, 8h as 18h</span></div><a href="https://instagram.com/trihbaupetshop" target="_blank" rel="noreferrer"><Camera/><span><small>Instagram</small>@trihbaupetshop</span></a></div><a href={WHATSAPP} target="_blank" rel="noreferrer" className="button button-primary"><MessageCircle size={18}/> Fale conosco no WhatsApp</a></div><div className="map-wrap reveal"><iframe title="Mapa da TrihbAU PetShop" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Rua%20Conrado%20Cabral%2C%20664B%20-%20Monte%20Castelo%2C%20Fortaleza&output=embed"/></div></section>
    </main>
    <footer><Logo compact/><p>Pet care boutique em Fortaleza.</p><div><a href="https://instagram.com/trihbaupetshop" target="_blank" rel="noreferrer">Instagram</a><a href={WHATSAPP} target="_blank" rel="noreferrer">WhatsApp</a></div><small>© {new Date().getFullYear()} TrihbAU PetShop. Todos os direitos reservados.</small></footer><a className="whatsapp-float" href={WHATSAPP} target="_blank" rel="noreferrer" aria-label="Conversar pelo WhatsApp"><MessageCircle/></a>
  </div>;
}