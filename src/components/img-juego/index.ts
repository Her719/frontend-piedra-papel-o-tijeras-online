export type Move = "piedra" | "papel" | "tijera";

export function image() {
  class ImgJuego extends HTMLElement {
    private shadow: ShadowRoot;
    private selectedMove: Move | null = null;

    //  URLs de imágenes (resueltas como pediste)
    private piedraUrl = new URL("./piedra.png", import.meta.url).href;
    private papelUrl = new URL("./papel.png", import.meta.url).href;
    private tijeraUrl = new URL("./tijera.png", import.meta.url).href;

    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
    }

    static get observedAttributes() {
      return ["mode", "player", "cpu"];
    }

    connectedCallback() {
      this.render();
    }

    attributeChangedCallback() {
      this.render();
    }

    private getImgByMove(move: Move) {
      if (move === "piedra") return this.piedraUrl;
      if (move === "papel") return this.papelUrl;
      return this.tijeraUrl;
    }

    private render() {
      const mode = this.getAttribute("mode") ?? "static";
      const player = this.getAttribute("player") as Move | null;
      const cpu = this.getAttribute("cpu") as Move | null;

      // MODO ESTATICO de las jugadas
      if (mode === "static" && player && cpu) {
        this.shadow.innerHTML = `
  <style>
    :host {
      display: block;
      height: 100%;
    }

    .result {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 24px 0;
      box-sizing: border-box;
    }

    .column {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    img {
      width: 80px;
    }

    span {
      font-family: "Permanent Marker", cursive;
      font-size: 18px;
    }

    .cpu img {
      transform: rotate(180deg);
    }
  </style>
  
  <div class="result">
    <div class="column cpu">
      <img src="${this.getImgByMove(cpu)}" />
      <span>CPU</span>
    </div>

    <div class="column player">
      <span>Jugador</span>
      <img src="${this.getImgByMove(player)}" />
    </div>
  </div>
`;

        return;
      }

      // MODO INTERACTIVO
      this.shadow.innerHTML = `
        <style>
          footer {
            display: flex;
            justify-content: space-around;
            gap: 24px;
          }

          img {
            width: 50px;
            cursor: pointer;
            transition: transform 0.2s ease;
          }

          img.selected {
            transform: scale(1.3);
          }
        </style>

        <footer>
          <img data-move="piedra" src="${this.piedraUrl}" />
          <img data-move="papel" src="${this.papelUrl}" />
          <img data-move="tijera" src="${this.tijeraUrl}" />
        </footer>
      `;

      this.addEvents();
    }

    private addEvents() {
      const images = this.shadow.querySelectorAll("img");

      images.forEach((img) => {
        img.addEventListener("click", () => {
          const move = img.getAttribute("data-move") as Move;
          this.selectedMove = move;

          images.forEach((i) => i.classList.toggle("selected", i === img));

          this.dispatchEvent(
            new CustomEvent("choice", {
              detail: move,
              bubbles: true,
              composed: true,
            }),
          );
        });
      });
    }
  }

  if (!customElements.get("img-juego")) {
    customElements.define("img-juego", ImgJuego);
  }
}
