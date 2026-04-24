export function button() {
  class ButtonComponent extends HTMLElement {
    constructor() {
      super();
      this.render();
    }

    render() {
      const shadow = this.attachShadow({ mode: "open" });
      const button = document.createElement("button");
      const style = document.createElement("style");

      const action = this.getAttribute("action") ?? "next";

      button.className = "root";
      button.textContent = this.textContent ?? "";

      button.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("btn-click", {
            bubbles: true,
            composed: true,
            detail: { action },
          }),
        );
      });

      style.innerHTML = `
        .root{
          font-family: Odibee Sans;
          font-size: 45px;
          font-weight: 400;
          min-width: 322px;
          min-height: 87px;
          border-radius: 10px;
          color: #D8FCFC;
          background-color: #006CFC;
          border:10px solid #001997;
          margin-top: 30px;
        }
      `;

      shadow.append(button, style);
    }
  }

  if (!customElements.get("btn-component")) {
    customElements.define("btn-component", ButtonComponent);
  }
}
