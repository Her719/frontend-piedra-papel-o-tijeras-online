type PageParams = {
  goTo: (path: string) => void;
};

export function initHome(params: PageParams) {
  const div = document.createElement("div");
  div.className = "page home";

  div.innerHTML = `
      <style>
        .titulo-game{
          width: 308px;
          height: 219px;
          display: inline-block;
        }

        .conteiner{
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 16px;
          box-sizing: border-box;
          padding: 24px;
        } 
      </style>

      <div class="conteiner">
        <text-game >
          <span class="titulo-game" slot="titulo">Piedra, Papel o Tijera</span>
        </text-game>

        <btn-component action="new">Nuevo Juego</btn-component>
        <btn-component action="join">Ingresar a sala existente</btn-component>

        <img-juego mode="static"></img-juego>
      </div>
    `;

  // attach listeners to the rendered custom buttons
  const buttons = div.querySelectorAll("btn-component");
  buttons.forEach((btn) => {
    // the custom element dispatches a "btn-click" CustomEvent with detail.action
    btn.addEventListener("btn-click", (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      const action = detail.action;
      if (action === "new") {
        params.goTo("/sign-in");
      } else if (action === "join") {
        params.goTo("/code-room");
      }
    });
  });

  return div;
}

// type PageParams = {
//   goTo: (path: string) => void;
// };

// export function initHome(params: PageParams) {
//   const div = document.createElement("div");
//   div.innerHTML = `
//       <style>
//         .titulo-game{
//           width: 308px;
//           height: 219px;
//         }

//         .conteiner{
//           width: 100%;
//           height: 100vh;
//           display: flex;
//           flex-direction: column;
//           justify-content: space-between;
//           align-items: center;
//       }
//       </style>

//       <div class="conteiner">
//       <text-game >
//         <span class="titulo-game" slot="titulo">Piedra, Papel o Tijera</span>
//       </text-game>

//         <btn-component action="new">
//           Nuevo Juego
//         </btn-component>

//         <btn-component action="join">
//           Ingresar a sala existente
//         </btn-component>

//         <img-juego mode="static"></img-juego>
//         </div>
//     `;

//   const buttons = div.querySelectorAll("btn-component");

//   buttons.forEach((btn) => {
//     btn.addEventListener("btn-click", (e: any) => {
//       if (e.detail.action === "new") {
//         params.goTo("/sign-in");
//       } else if (e.detail.action === "join") {
//         params.goTo("/code-room");
//       }
//     });
//   });

//   return div;
// }
