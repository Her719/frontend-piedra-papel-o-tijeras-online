import { initHome } from "../src/pages/aHome";
import { initSignIn } from "../src/pages/bSignIn";
import { initCodeRoom } from "../src/pages/cCodeRoom";
import { initToRoom } from "../src/pages/dToRoom";
import { initJuego } from "./pages/eJuego";
import { initResultado } from "./pages/fResultado";

const routes = [
  {
    path: /^\/home$/,
    component: initHome,
    background: true,
  },
  {
    path: /^\/sign-in$/,
    component: initSignIn,
    background: true,
  },
  {
    path: /^\/code-room$/,
    component: initCodeRoom,
    background: true,
  },
  {
    path: /^\/to-room$/,
    component: initToRoom,
    background: true,
  },
  {
    path: /^\/juego$/,
    component: initJuego,
    background: true,
  },
  {
    path: /^\/resultado$/,
    component: initResultado,
    background: false,
  },
];

// Helper para extraer parámetros del hash
export function getHashParams(): URLSearchParams {
  const hashPart = window.location.hash.replace("#", "");
  const queryStart = hashPart.indexOf("?");
  const queryString =
    queryStart !== -1 ? hashPart.substring(queryStart + 1) : "";
  return new URLSearchParams(queryString);
}

function getRouteFromHash() {
  const hash = window.location.hash.replace("#", "");
  return hash || "/home";
}

export function initRouter(container: Element) {
  let currentRoute = "";

  function goTo(path: string) {
    window.location.hash = path;
  }

  // Cambiar getRouteFromHash para devolver solo la ruta sin params
  function getRouteFromHash() {
    const hash = window.location.hash.replace("#", "");
    const route = hash.split("?")[0]; // Separar ruta de params
    return route || "/home";
  }

  function handleRoute(route: string) {
    if (route === currentRoute) return;
    currentRoute = route;
    console.log("Ruta actual:", route);

    for (const r of routes) {
      if (r.path.test(route)) {
        container.classList.toggle("with-background", r.background);

        const el = r.component({ goTo });

        container.replaceChildren(el);
      }
    }

    for (const r of routes) {
      if (r.path.test(route)) {
        const el = r.component({ goTo });
        container.replaceChildren(el);
        return;
      }
    }

    console.warn("Ruta no encontrada:", route);
    goTo("/home");
  }

  // Primera carga
  handleRoute(getRouteFromHash());

  // Escuchar cambios
  window.addEventListener("hashchange", () => {
    handleRoute(getRouteFromHash());
  });

  //CLAVE: devolvemos goTo
  return {
    goTo,
  };
}
