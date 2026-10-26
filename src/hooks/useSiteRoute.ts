import { useEffect, useState } from "react";

// Navegação interna do site (home x produtos) com suporte ao botão
// "voltar" do navegador via popstate.

export type SiteView = "home" | "products";

function viewFromPath(pathname: string): SiteView {
  return pathname === "/produtos" ? "products" : "home";
}

export function useSiteRoute() {
  const [siteView, setSiteView] = useState<SiteView>(() => viewFromPath(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setSiteView(viewFromPath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function openProducts() {
    window.history.pushState({}, "", "/produtos");
    setSiteView("products");
  }

  function returnHome() {
    window.history.pushState({}, "", "/");
    setSiteView("home");
  }

  return { siteView, openProducts, returnHome };
}
