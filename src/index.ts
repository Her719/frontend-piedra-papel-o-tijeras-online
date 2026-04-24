import { image } from "./components/img-juego/index";
import { initTextGame } from "./components/text-game/index";
import { button } from "./components/boton-component/index";
import { registerForms } from "./components/form-nameOrCode";
import { initRouter } from "./router";
import { timerGame } from "./components/timer-game/index";
import { resultGame } from "./components/resultado-game/index";
import { gameScore } from "./components/score-game/index";

//Fondo global
const fondoUrl = new URL("./fondo.png", import.meta.url).href;
const style = document.createElement("style");
style.textContent = `
  .root.with-background {
    background-image: url("${fondoUrl}");
  }
`;
document.head.appendChild(style);
//Registrar Web Components
image();
initTextGame();
button();
registerForms();
timerGame();
resultGame();
gameScore();
//Inicializar App
const root = document.querySelector(".root");
if (!root) throw new Error("No se encontró .root");

initRouter(root);
