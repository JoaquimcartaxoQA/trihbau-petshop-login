import logoImg from "../../assets/logo.png";

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand-lockup" aria-label="TrihbAU PetShop">
      <span className={`logo-mark ${compact ? "logo-mark--small" : ""}`}>
        <img
          src={logoImg}
          alt="TrihbAU PetShop"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </span>
      <span className="brand-name">
        Trihb<span>AU</span>
      </span>
      {!compact && <span className="brand-sub">PETSHOP</span>}
    </div>
  );
}
