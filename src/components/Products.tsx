import { ArrowLeft, MessageCircle, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGet, type Product } from "../services/api";
import { createProductWhatsAppUrl } from "../utils/whatsapp";

interface ProductsProps {
  onBack: () => void;
}

const productColors: Record<string, string> = {
  shampoo: "#e7c3dc",
  racao: "#e7d5a8",
  mordedor: "#c4dce1",
  guia: "#d5c4e7",
};

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function Products({ onBack }: ProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setProducts(
          await apiGet<Product[]>("/api/products", "Não foi possível carregar os produtos.", null),
        );
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível carregar os produtos.",
        );
      }
    }

    void loadProducts();
  }, []);

  function buyProduct(product: Product) {
    window.open(createProductWhatsAppUrl(product), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="products-page">
      <header className="products-header">
        <button className="products-back-button" type="button" onClick={onBack}>
          <ArrowLeft size={18} /> Voltar
        </button>
        <div>
          <p className="eyebrow">Loja TrihbAU</p>
          <h1>Cuidados para o seu pet.</h1>
          <p>Produtos escolhidos para transformar a rotina em bem-estar.</p>
        </div>
        <ShoppingBag className="products-header-icon" size={34} />
      </header>

      <main className="products-content">
        {error && <p className="products-error">{error}</p>}
        <div className="products-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <div
                className="product-visual"
                style={{ background: productColors[product.image] ?? "#eee" }}
              >
                <ShoppingBag size={48} strokeWidth={1.2} />
              </div>
              <div className="product-card-content">
                <p className="product-category">TrihbAU essentials</p>
                <h2>{product.name}</h2>
                <p className="product-description">{product.description}</p>
                <div className="product-card-footer">
                  <strong>{money.format(product.priceCents / 100)}</strong>
                  <button
                    type="button"
                    title="Comprar pelo WhatsApp"
                    onClick={() => buyProduct(product)}
                  >
                    <MessageCircle size={16} /> Comprar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
