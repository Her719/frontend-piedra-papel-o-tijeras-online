export function timerGame() {
  class TimerGame extends HTMLElement {
    private shadow: ShadowRoot;
    private time = 3;
    private intervalId: number | null = null;

    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      this.render();
      this.start();
    }

    disconnectedCallback() {
      if (this.intervalId) clearInterval(this.intervalId);
    }

    private start() {
      this.intervalId = window.setInterval(() => {
        this.time--;
        this.updateNumber();

        if (this.time < 0) {
          this.stop();

          // se auto-oculta del layout
          this.classList.add("hidden");

          // avisa a la page
          this.dispatchEvent(
            new CustomEvent("timeout", {
              bubbles: true,
              composed: true,
            }),
          );
        }
      }, 1000);
    }

    private stop() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }

    private updateNumber() {
      const numberEl = this.shadow.querySelector(".number");
      if (numberEl) {
        numberEl.textContent = this.time >= 0 ? String(this.time) : "";
      }
    }

    private render() {
      const radius = 45;
      const circumference = 2 * Math.PI * radius;

      this.shadow.innerHTML = `
        <style>
          :host {
            display: block;
          }

          :host(.hidden) {
            display: none;
          }

          .container {
            width: 120px;
            height: 120px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          svg {
            position: absolute;
            transform: rotate(-90deg);
          }

          circle {
            fill: none;
            stroke-width: 8;
            stroke: #000;
            stroke-dasharray: ${circumference};
            stroke-dashoffset: 0;
            animation: countdown 3s linear forwards;
          }

          @keyframes countdown {
            from {
              stroke-dashoffset: 0;
            }
            to {
              stroke-dashoffset: ${circumference};
            }
          }

          .number {
            font-size: 48px;
            font-weight: bold;
          }
        </style>

        <div class="container">
          <svg width="120" height="120">
            <circle cx="60" cy="60" r="${radius}" />
          </svg>
          <div class="number">${this.time}</div>
        </div>
      `;
    }
  }

  if (!customElements.get("timer-game")) {
    customElements.define("timer-game", TimerGame);
  }
}
