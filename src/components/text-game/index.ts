export function initTextGame() {
  class TextGame extends HTMLElement {
    private root: ShadowRoot;

    constructor() {
      super();
      this.root = this.attachShadow({ mode: "open" });
    }

    hideEmptySlots() {
      const containers = this.root.querySelectorAll(".hide-if-empty");

      containers.forEach((container) => {
        const slots = container.querySelectorAll("slot");

        const hasContent = Array.from(slots).some((slot) => {
          return slot.assignedElements({ flatten: true }).length > 0;
        });

        (container as HTMLElement).style.display = hasContent ? "" : "none";
      });
    }

    connectedCallback() {
      this.render();
    }

    render() {
      this.root.innerHTML = `
    <style>
      :host {
        display: flex;
      }
      h1, h2, p{
      margin: 0;
      }
      
      .titulo{
        font-size: 80px;
        font-weight: 700;
        color: #009048;
        text-align: center;
        font-family: Permanent Marker;
        max-width: 308px;
        min-height: 219px;
        }
        

      
      
      .subtitle1{
        font-size: 40px;
        font-weight: 600;
        color: #000000;
        text-align: center;
        font-family: Permanent Marker;
        max-width: 317px;
        min-width: 300px;
        min-height: 240px;
      }
      
      .intro{
      font-size: 18px;
      font-weight: 400;
      }
      
      .info-destacada{
      font-size: 22px;
      font-weight: 500;
      }

      
    </style>
      <h1 class="hide-if-empty titulo">
        <slot name="titulo"></slot>
      </h1>

      <h2 class="hide-if-empty subtitle1">
        <slot name="subtitle1"></slot>
      </h2>

      <p class="hide-if-empty subtitle1">
        <slot name="subtitle1-p1"></slot>
      </p>

  `;

      this.hideEmptySlots();

      this.root.querySelectorAll("slot").forEach((slot) => {
        slot.addEventListener("slotchange", () => this.hideEmptySlots());
      });
    }
  }

  if (!customElements.get("text-game")) {
    customElements.define("text-game", TextGame);
  }
}
