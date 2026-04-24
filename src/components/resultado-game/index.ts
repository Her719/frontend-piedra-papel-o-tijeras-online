export function resultGame() {
  // Parcel detecta estos assets y genera la URL correcta
  const winUrl = new URL("./resultado-win.png", import.meta.url).href;
  const loseUrl = new URL("./resultado-loser.png", import.meta.url).href;

  class ResultGame extends HTMLElement {
    private shadow: ShadowRoot;
    private result: "jugador" | "cpu" | "empate" | null = null;

    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
    }

    static get observedAttributes() {
      return ["result"];
    }

    attributeChangedCallback(name: string, _: string, newValue: string) {
      if (name === "result") {
        this.result = newValue as any;
        this.render();
      }
    }

    connectedCallback() {
      this.result = this.getAttribute("result") as any;
      this.render();
    }

    private render() {
      if (!this.result) return;

      let bgColor = "";
      let imgSrc = "";
      let altText = "";

      if (this.result === "jugador") {
        bgColor = "#4CAF50";
        imgSrc = winUrl;
        altText = "Ganaste";
      }

      if (this.result === "cpu") {
        bgColor = "#8B5A2B";
        imgSrc = loseUrl;
        altText = "Perdiste";
      }

      if (this.result === "empate") {
        bgColor = "#999";
        altText = "Empate";
      }

      this.shadow.innerHTML = `
    <style>
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      .container {
        width: 100%;
        min-height: 100vh;
        background-color: ${bgColor};
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        padding: 24px;
        box-sizing: border-box;
      }

      .result {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      img {
        max-width: 70%;
      }

      ::slotted(*) {
        z-index: 1;
      }
    </style>

    <div class="container">
      <div class="result">
        ${
          imgSrc
            ? `<img src="${imgSrc}" alt="${altText}" />`
            : `<div class="text">EMPATE</div>`
        }
      </div>

      <!-- acá entran tus componentes -->
      <slot></slot>
    </div>
  `;
    }
  }

  if (!customElements.get("result-game")) {
    customElements.define("result-game", ResultGame);
  }
}
//METODO DE USO:
//  <result-game result="jugador"></result-game>
// <!-- o -->
// <result-game result="cpu"></result-game>
// <!-- o -->
// <result-game result="empate"></result-game>
