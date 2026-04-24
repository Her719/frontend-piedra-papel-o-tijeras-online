export function registerForms() {
  class NameForm extends HTMLElement {
    private shadow: ShadowRoot;
    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
    }
    connectedCallback() {
      this.render();
    }
    private render() {
      this.shadow.innerHTML = `
        <style>
          :host {
            display:block;
            width:100%;
            font-family: 'Odibee Sans', sans-serif;
            box-sizing:border-box;
          }
          .wrap {
            display:flex;
            flex-direction:column;
            align-items:center;
            gap:18px;
            width:100%;
            max-width:420px;
            margin:0 auto;
          }
          .label {
            font-size:34px;
            text-align:center;
            color:#000;
          }
          .input {
            width:100%;
            height:66px;
            padding:0 18px;
            font-size:28px;
            border-radius:14px;
            border:10px solid #001997;
            outline:none;
          }
          .error {
            color:#b00020;
            font-size:14px;
            min-height:18px;
            text-align:center;
          }
        </style>

        <div class="wrap">
          <div class="label">Tu Nombre</div>
          <input id="name" class="input" maxlength="30" placeholder="Ej: Juan" />
          <div class="error" id="err"></div>
        </div>
      `;

      const input = this.shadow.querySelector<HTMLInputElement>("#name")!;
      const err = this.shadow.querySelector<HTMLDivElement>("#err")!;

      const validate = (v: string) => v.length >= 2 && v.length <= 30;

      //AUTO GUARDADO
      input.addEventListener("input", () => {
        const val = input.value.trim();
        err.textContent = "";
        if (validate(val)) {
          localStorage.setItem("userName", val);
        }
      });

      input.addEventListener("blur", () => {
        const val = input.value.trim();

        if (!validate(val)) {
          err.textContent = "Nombre inválido (2 a 30 caracteres)";
        }
      });
    }
  }
  if (!customElements.get("name-form"))
    customElements.define("name-form", NameForm);

  class RoomCodeForm extends HTMLElement {
    private shadow: ShadowRoot;
    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
    }
    connectedCallback() {
      this.render();
    }
    private render() {
      this.shadow.innerHTML = `
        <style>
          :host {
            display:block;
            width:100%;
            font-family: 'Odibee Sans', sans-serif;
            box-sizing:border-box;
          }
          .wrap {
            display:flex;
            flex-direction:column;
            align-items:center;
            gap:12px;
            width:100%;
            max-width:420px;
            margin:0 auto;
          }
          .code-input {
            width:100%;
            height:66px;
            padding:0 18px;
            font-size:28px;
            border-radius:14px;
            border:10px solid #001997;
            text-align:center;
            text-transform:uppercase;
            outline:none;
          }
          .submit {
            width:100%;
            height:74px;
            font-size:28px;
            color:#D8FCFC;
            background:#0078FF;
            border:10px solid #001997;
            border-radius:12px;
            cursor:pointer;
          }
          .error {
            color:#b00020;
            font-size:14px;
            min-height:18px;
            text-align:center;
          }
        </style>

        <div class="wrap">
          <input id="code" class="code-input" maxlength="5" placeholder="código" />
          <div class="error" id="err"></div>
          <button id="submit" class="submit">Ingresar a la sala</button>
        </div>
      `;
      const input = this.shadow.querySelector<HTMLInputElement>("#code")!;
      const err = this.shadow.querySelector<HTMLDivElement>("#err")!;
      const btn = this.shadow.querySelector<HTMLButtonElement>("#submit")!;

      const validate = (v: string) => /^[A-Z0-9]{5}$/.test(v);
      input.addEventListener("input", () => {
        input.value = input.value.toUpperCase();
        err.textContent = "";
      });
      const submit = () => {
        const val = input.value.trim().toUpperCase();
        if (!validate(val)) {
          err.textContent = "Código inválido (5 caracteres)";
          return;
        }
        this.dispatchEvent(
          new CustomEvent("submit-code", {
            detail: { code: val },
            bubbles: true,
            composed: true,
          }),
        );
      };
      btn.addEventListener("click", submit);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") submit();
      });
    }
  }
  if (!customElements.get("room-code-form"))
    customElements.define("room-code-form", RoomCodeForm);
}
