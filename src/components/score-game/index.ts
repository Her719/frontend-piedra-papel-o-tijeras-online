export function gameScore() {
  class GameScore extends HTMLElement {
    private shadow: ShadowRoot;
    private player1Name: string = "Jugador 1";
    private player1Score: number = 0;
    private player2Name: string = "Jugador 2";
    private player2Score: number = 0;
    private empates: number = 0;

    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
    }

    static get observedAttributes() {
      return [
        "player1-name",
        "player1-score",
        "player2-name",
        "player2-score",
        "empates",
      ];
    }

    connectedCallback() {
      this.player1Name = this.getAttribute("player1-name") || "Jugador 1";
      this.player1Score = Number(this.getAttribute("player1-score")) || 0;
      this.player2Name = this.getAttribute("player2-name") || "Jugador 2";
      this.player2Score = Number(this.getAttribute("player2-score")) || 0;
      this.empates = Number(this.getAttribute("empates")) || 0;
      this.render();
    }

    attributeChangedCallback(
      name: string,
      _oldValue: string,
      newValue: string,
    ) {
      if (name === "player1-name") this.player1Name = newValue || "Jugador 1";
      if (name === "player1-score") this.player1Score = Number(newValue) || 0;
      if (name === "player2-name") this.player2Name = newValue || "Jugador 2";
      if (name === "player2-score") this.player2Score = Number(newValue) || 0;
      if (name === "empates") this.empates = Number(newValue) || 0;
      this.render();
    }

    set _player1Name(value: string) {
      this.setAttribute("player1-name", value);
    }

    get _player1Name(): string {
      return this.player1Name;
    }

    set _player1Score(value: number) {
      this.player1Score = value;
      this.setAttribute("player1-score", String(value));
    }

    get _player1Score(): number {
      return this.player1Score;
    }

    set _player2Name(value: string) {
      this.setAttribute("player2-name", value);
    }

    get _player2Name(): string {
      return this.player2Name;
    }

    set _player2Score(value: number) {
      this.player2Score = value;
      this.setAttribute("player2-score", String(value));
    }

    get _player2Score(): number {
      return this.player2Score;
    }

    set _empates(value: number) {
      this.empates = value;
      this.setAttribute("empates", String(value));
    }

    get _empates(): number {
      return this.empates;
    }

    updateScore(score: { player1: number; player2: number; empates: number }) {
      this._player1Score = score.player1;
      this._player2Score = score.player2;
      this._empates = score.empates;
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
            padding: 24px 32px;
            border-radius: 12px;
            justify-content: center;
          }
          .item {
            text-align: center;
          }
          .label {
            font-size: 14px;
            opacity: 0.7;
            margin-bottom: 8px;
          }
          .value {
            font-size: 36px;
            font-weight: bold;
          }
        </style>
        <div class="score">
          <div class="item">
            <div class="label">${this.player1Name}</div>
            <div class="value">${this.player1Score}</div>
          </div>

          <div class="item">
            <div class="label">${this.player2Name}</div>
            <div class="value">${this.player2Score}</div>
          </div>

        </div>
      `;
    }
  }
  if (!customElements.get("game-score")) {
    customElements.define("game-score", GameScore);
  }
}
