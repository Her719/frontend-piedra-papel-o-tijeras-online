export function gameHeader() {
  customElements.define(
    "game-header",
    class extends HTMLElement {
      private _roomId: string = "";
      private _player1Name: string = "";
      private _player1Score: number = 0;
      private _player2Name: string = "";
      private _player2Score: number = 0;
      private _empates: number = 0;

      static get observedAttributes() {
        return [
          "room-id",
          "player1-name",
          "player1-score",
          "player2-name",
          "player2-score",
          "empates",
        ];
      }

      constructor() {
        super();
        this.attachShadow({ mode: "open" });
      }

      connectedCallback() {
        this.render();
      }

      attributeChangedCallback(
        name: string,
        oldValue: string | null,
        newValue: string | null,
      ) {
        if (name === "room-id") this._roomId = newValue || "";
        if (name === "player1-name") this._player1Name = newValue || "";
        if (name === "player1-score")
          this._player1Score = parseInt(newValue || "0");
        if (name === "player2-name") this._player2Name = newValue || "";
        if (name === "player2-score")
          this._player2Score = parseInt(newValue || "0");
        if (name === "empates") this._empates = parseInt(newValue || "0");
        this.render();
      }

      // Setters para actualización desde JavaScript
      set roomId(value: string) {
        this.setAttribute("room-id", value);
      }

      get roomId(): string {
        return this._roomId;
      }

      set player1Name(value: string) {
        this.setAttribute("player1-name", value);
      }

      get player1Name(): string {
        return this._player1Name;
      }

      set player1Score(value: number) {
        this._player1Score = value;
        this.setAttribute("player1-score", String(value));
      }

      get player1Score(): number {
        return this._player1Score;
      }

      set player2Name(value: string) {
        this.setAttribute("player2-name", value);
      }

      get player2Name(): string {
        return this._player2Name;
      }

      set player2Score(value: number) {
        this._player2Score = value;
        this.setAttribute("player2-score", String(value));
      }

      get player2Score(): number {
        return this._player2Score;
      }

      set empates(value: number) {
        this._empates = value;
        this.setAttribute("empates", String(value));
      }

      get empates(): number {
        return this._empates;
      }

      // ✅ Métodos públicos para actualizar lógica interna
      updateScore(score: {
        player1: number;
        player2: number;
        empates: number;
      }) {
        this.player1Score = score.player1;
        this.player2Score = score.player2;
        this.empates = score.empates;
      }

      updatePlayersFromState(state: any, userId: string, userName: string) {
        if (!state?.players) return;

        if (state.players.player1.id === userId) {
          this.player1Name = userName;
        } else {
          this.player1Name = state.players.player1.name || "Jugador 1";
        }

        if (state.players.player2.id === userId) {
          this.player2Name = userName;
        } else {
          this.player2Name = state.players.player2.name || "Jugador 2";
        }
      }

      private render() {
        if (!this.shadowRoot) return;
        this.shadowRoot.innerHTML = `
          <style>
            .header {
              position: relative;
              width: 100%;
              height: 100px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding: 20px 24px;
              box-sizing: border-box;
            }
            .score-section {
              display: flex;
              flex-direction: column;
              gap: 5px;
              font-size: 18px;
              font-weight: 700;
              border-radius: 0px 20px 0px 20px;
              padding: 5px 7px;
              background: rgba(0, 0, 0, 0.08);
            }
            .score-item {
              display: flex;
              justify-content: space-between;
              min-width: 180px;
              gap: 8px;
            }
            .room-id-section {
              font-size: 18px;
              font-weight: 800;
              letter-spacing: 3px;
              padding: 8px 12px;
              background: rgba(0, 0, 0, 0.08);
              border-radius: 8px;
            }
          </style>
          <div class="header">
            <div class="score-section">
              <div class="score-item">
                <span>${this._player1Name}</span>
                <span>${this._player1Score}</span>
              </div>
              <div class="score-item">
                <span>${this._player2Name}</span>
                <span>${this._player2Score}</span>
              </div>
              <div class="score-item">
                <span>Empates</span>
                <span>${this._empates}</span>
              </div>
            </div>
            <div class="room-id-section">${this._roomId}</div>
          </div>
        `;
      }
    },
  );
}

// export function gameHeader() {
//   customElements.define(
//     "game-header",
//     class extends HTMLElement {
//       private _roomId: string = "";
//       private _player1Name: string = "";
//       private _player1Score: number = 0;
//       private _player2Name: string = "";
//       private _player2Score: number = 0;
//       private _empates: number = 0;

//       static get observedAttributes() {
//         return [
//           "room-id",
//           "player1-name",
//           "player1-score",
//           "player2-name",
//           "player2-score",
//           "empates",
//         ];
//       }

//       constructor() {
//         super();
//         this.attachShadow({ mode: "open" });
//       }

//       connectedCallback() {
//         this.render();
//       }

//       attributeChangedCallback(
//         name: string,
//         oldValue: string | null,
//         newValue: string | null,
//       ) {
//         if (name === "room-id") this._roomId = newValue || "";
//         if (name === "player1-name") this._player1Name = newValue || "";
//         if (name === "player1-score")
//           this._player1Score = parseInt(newValue || "0");
//         if (name === "player2-name") this._player2Name = newValue || "";
//         if (name === "player2-score")
//           this._player2Score = parseInt(newValue || "0");
//         if (name === "empates") this._empates = parseInt(newValue || "0");
//         this.render();
//       }

//       // Setters para actualización desde JavaScript
//       set roomId(value: string) {
//         this.setAttribute("room-id", value);
//       }

//       get roomId(): string {
//         return this._roomId;
//       }

//       set player1Name(value: string) {
//         this.setAttribute("player1-name", value);
//       }

//       get player1Name(): string {
//         return this._player1Name;
//       }

//       set player1Score(value: number) {
//         this._player1Score = value;
//         this.setAttribute("player1-score", String(value));
//       }

//       get player1Score(): number {
//         return this._player1Score;
//       }

//       set player2Name(value: string) {
//         this.setAttribute("player2-name", value);
//       }

//       get player2Name(): string {
//         return this._player2Name;
//       }

//       set player2Score(value: number) {
//         this._player2Score = value;
//         this.setAttribute("player2-score", String(value));
//       }

//       get player2Score(): number {
//         return this._player2Score;
//       }

//       set empates(value: number) {
//         this._empates = value;
//         this.setAttribute("empates", String(value));
//       }

//       get empates(): number {
//         return this._empates;
//       }

//       private render() {
//         if (!this.shadowRoot) return;
//         this.shadowRoot.innerHTML = `
//           <style>
//             .header {
//               position: relative;
//               width: 100%;
//               height: 100px;
//               display: flex;
//               justify-content: space-between;
//               align-items: flex-start;
//               padding: 20px 24px;
//               box-sizing: border-box;
//             }
//             .score-section {
//               display: flex;
//               flex-direction: column;
//               gap: 5px;
//               font-size: 18px;
//               font-weight: 700;
//                 border-radius: 0px 20px 0px 20px;
//                 padding: 5px 7px;
//                 background: #e284bb;
//             }
//             .score-item {
//               display: flex;
//               justify-content: space-between;
//               min-width: 180px;
//               gap: 12px;
//             }
//             .room-id-section {
//               font-size: 18px;
//               font-weight: 800;
//               letter-spacing: 3px;
//               padding: 8px 12px;
//               background: #e284bb;
//                 border-radius: 20px;
//             }
//           </style>
//           <div class="header">
//             <div class="score-section">
//               <div class="score-item">
//                 <span>${this._player1Name}</span>
//                 <span>${this._player1Score}</span>
//               </div>
//               <div class="score-item">
//                 <span>${this._player2Name}</span>
//                 <span>${this._player2Score}</span>
//               </div>
//               <div class="score-item">
//                 <span>Empates</span>
//                 <span>${this._empates}</span>
//               </div>
//             </div>
//             <div class="room-id-section">${this._roomId}</div>
//           </div>
//         `;
//       }
//     },
//   );
// }
