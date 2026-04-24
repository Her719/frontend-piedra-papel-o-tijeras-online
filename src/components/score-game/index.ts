export function gameScore() {
  class GameScore extends HTMLElement {
    private shadow: ShadowRoot;
    private jugador1 = 0;
    private jugador2 = 0;
    private empates = 0;
    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
    }
    static get observedAttributes() {
      return ["jugador1", "jugador2", "empates"];
    }
    attributeChangedCallback(
      name: string,
      _oldValue: string,
      newValue: string,
    ) {
      const value = Number(newValue) || 0;
      if (name === "jugador1") this.jugador1 = value;
      if (name === "jugador2") this.jugador2 = value;
      if (name === "empates") this.empates = value;
      this.render();
    }
    connectedCallback() {
      this.jugador1 = Number(this.getAttribute("jugador1")) || 0;
      this.jugador2 = Number(this.getAttribute("jugador2")) || 0;
      this.empates = Number(this.getAttribute("empates")) || 0;
      this.render();
    }
    private render() {
      this.shadow.innerHTML = `
        <style>
          :host {
            display: block;
            font-family: sans-serif;
          }
          .score {
            display: flex;
            gap: 24px;
            background: #222;
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            justify-content: center;
          }
          .item {
            text-align: center;
          }
          .label {
            font-size: 14px;
            opacity: 0.7;
          }
          .value {
            font-size: 32px;
            font-weight: bold;
          }
        </style>
        <div class="score">
          <div class="item">
            <div class="label">Jugador 1</div>
            <div class="value">${this.jugador1}</div>
          </div>

          <div class="item">
            <div class="label">Jugador 2</div>
            <div class="value">${this.jugador2}</div>
          </div>

          <div class="item">
            <div class="label">Empates</div>
            <div class="value">${this.empates}</div>
          </div>
        </div>
      `;
    }
  }
  if (!customElements.get("game-score")) {
    customElements.define("game-score", GameScore);
  }
}
//METODO DE USO:
//<game-score jugador1="0" jugador2="0" empates="0" ></game-score>
