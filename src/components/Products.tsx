import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  image: string;
}

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
  const [addedProductId, setAddedProductId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("http://localhost:3001/api/products");
        if (!response.ok) throw new Error("Não foi possível carregar os produtos.");
        setProducts(await response.json());
      } catch (requestError) {
        setError(
          requestError instanceof Error ? requestError.message : "Erro ao carregar produtos.",
        );
      }
    }

    void loadProducts();
  }, []);

  function addProduct(id: number) {
    setAddedProductId(id);
    window.setTimeout(() => setAddedProductId(null), 1800);
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
                  <button type="button" onClick={() => addProduct(product.id)}>
                    {addedProductId === product.id ? (
                      <>
                        <Check size={16} /> Adicionado
                      </>
                    ) : (
                      "Adicionar"
                    )}
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
