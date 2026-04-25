import { listenToRoom, markOnline, getRoomScore } from "../../state";
import { getHashParams } from "../../router";

type PageParams = {
  goTo: (path: string) => void;
};

export function initToRoom(params: PageParams) {
  const div = document.createElement("div");
  div.className = "page waiting";
  const searchParams = getHashParams();
  const roomId = searchParams.get("roomId");
  const rtdbRoomId = searchParams.get("rtdbRoomId");
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || userId;

  //VALIDACIONES CRÍTICAS
  if (!roomId || !rtdbRoomId) {
    console.error("Faltan params en URL");
    params.goTo("/home");
    return div;
  }
  if (!userId) {
    console.error("No hay userId");
    params.goTo("/sign-in");
    return div;
  }

  div.innerHTML = `
    <style>
      .container {
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 18px;
        padding: 24px;
        box-sizing: border-box;
        text-align: center;
      }
      .subtitle {
        font-size: 22px;
        font-weight: 600;
        color: #333;
      }
      .status {
        font-size: 18px;
        color: #666;
      }
      .room-code {
        font-size: 64px;
        font-weight: 800;
        letter-spacing: 8px;
        margin: 10px 0;
      }
      button {
        width: 240px;
        height: 80px;
        font-size: 32px;
        border: 10px solid #001997;
        background: #0078FF;
        color: white;
        border-radius: 12px;
        font-family: 'Odibee Sans', sans-serif;
        cursor: pointer;
      }
      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    </style>

    <game-header
      room-id="${roomId}"
      player1-name="${userName}"
      player1-score="0"
      player2-name="Jugador 2"
      player2-score="0"
      empates="0"
    ></game-header>

    <div class="container">
      <div class="subtitle">Compartí el código</div>
      <div class="room-code">${roomId}</div>
      <div class="subtitle">Con tu contrincante</div>
      <div class="status" id="status">Esperando jugador...</div>
      <button id="start-btn" disabled>START</button>
      <img-juego mode="static"></img-juego>
    </div>
  `;

  const gameHeader = div.querySelector("game-header") as any;
  const statusEl = div.querySelector("#status")!;
  const startBtn = div.querySelector("#start-btn")! as HTMLButtonElement;

  function isReady(state: any) {
    return state.players?.player1?.online && state.players?.player2?.online;
  }

  function updateStatusUI(state: any) {
    if (!state?.players) return;
    if (isReady(state)) {
      statusEl.textContent = "Ambos jugadores listos ✔";
      startBtn.disabled = false;
    } else {
      statusEl.textContent = "Esperando jugador...";
      startBtn.disabled = true;
    }
  }

  //marcar online
  markOnline(rtdbRoomId, userId);

  //traer score UNA sola vez
  (async () => {
    try {
      const data = await getRoomScore(roomId);
      gameHeader.updateScore(data.score);
    } catch (e) {
      console.error("Error trayendo score", e);
    }
  })();

  //realtime SOLO para estado del room
  listenToRoom(rtdbRoomId, (state) => {
    if (!state) {
      console.warn("Room state null");
      return;
    }
    gameHeader.updatePlayersFromState(state, userId, userName!);
    updateStatusUI(state);
  });

  startBtn.addEventListener("click", () => {
    params.goTo(`/juego?roomId=${roomId}&rtdbRoomId=${rtdbRoomId}`);
  });

  return div;
}

// import { listenToRoom, markOnline, getRoomScore } from "../../state";
// import { getHashParams } from "../../router";

// type PageParams = {
//   goTo: (path: string) => void;
// };

// export function initToRoom(params: PageParams) {
//   const div = document.createElement("div");
//   div.className = "page waiting";
//   const searchParams = getHashParams();
//   const roomId = searchParams.get("roomId");
//   const rtdbRoomId = searchParams.get("rtdbRoomId");
//   const userId = localStorage.getItem("userId");
//   const userName = localStorage.getItem("userName") || userId;

//   //VALIDACIONES CRÍTICAS
//   if (!roomId || !rtdbRoomId) {
//     console.error("Faltan params en URL");
//     params.goTo("/home");
//     return div;
//   }
//   if (!userId) {
//     console.error("No hay userId");
//     params.goTo("/sign-in");
//     return div;
//   }

//   //estado local de score
//   let score = { player1: 0, player2: 0, empates: 0 };

//   div.innerHTML = `
//     <style>
//       .container {
//         width: 100%;
//         height: 100vh;
//         display: flex;
//         flex-direction: column;
//         justify-content: center;
//         align-items: center;
//         gap: 18px;
//         padding: 24px;
//         box-sizing: border-box;
//         text-align: center;
//       }
//       .subtitle {
//         font-size: 22px;
//         font-weight: 600;
//         color: #333;
//       }
//       .status {
//         font-size: 18px;
//         color: #666;
//       }
//       .room-code {
//         font-size: 64px;
//         font-weight: 800;
//         letter-spacing: 8px;
//         margin: 10px 0;
//       }
//       button {
//         width: 240px;
//         height: 80px;
//         font-size: 32px;
//         border: 10px solid #001997;
//         background: #0078FF;
//         color: white;
//         border-radius: 12px;
//         font-family: 'Odibee Sans', sans-serif;
//         cursor: pointer;
//       }
//       button:disabled {
//         opacity: 0.5;
//         cursor: not-allowed;
//       }
//     </style>

//     <game-header
//       room-id="${roomId}"
//       player1-name="${userName}"
//       player1-score="0"
//       player2-name="Jugador 2"
//       player2-score="0"
//       empates="0"
//     ></game-header>

//     <div class="container">
//       <div class="subtitle">Compartí el código</div>
//       <div class="room-code">${roomId}</div>
//       <div class="subtitle">Con tu contrincante</div>
//       <div class="status" id="status">Esperando jugador...</div>
//       <button id="start-btn" disabled>START</button>
//       <img-juego mode="static"></img-juego>
//     </div>
//   `;

//   const gameHeader = div.querySelector("game-header") as any;
//   const statusEl = div.querySelector("#status")!;
//   const startBtn = div.querySelector("#start-btn")! as HTMLButtonElement;

//   function isReady(state: any) {
//     return state.players?.player1?.online && state.players?.player2?.online;
//   }

//   function updateScoreUI() {
//     gameHeader.player1Score = score.player1;
//     gameHeader.player2Score = score.player2;
//     gameHeader.empates = score.empates;
//   }

//   function updatePlayersUI(state: any) {
//     if (!state?.players) return;

//     if (state.players.player1.id === userId) {
//       gameHeader.player1Name = userName!;
//     } else {
//       gameHeader.player1Name = state.players.player1.name || "Jugador 1";
//     }

//     if (state.players.player2.id === userId) {
//       gameHeader.player2Name = userName!;
//     } else {
//       gameHeader.player2Name = state.players.player2.name || "Jugador 2";
//     }
//   }

//   function updateStatusUI(state: any) {
//     if (!state?.players) return;
//     if (isReady(state)) {
//       statusEl.textContent = "Ambos jugadores listos ✔";
//       startBtn.disabled = false;
//     } else {
//       statusEl.textContent = "Esperando jugador...";
//       startBtn.disabled = true;
//     }
//   }

//   //marcar online
//   markOnline(rtdbRoomId, userId);

//   //traer score UNA sola vez
//   (async () => {
//     try {
//       const data = await getRoomScore(roomId);
//       score = data.score;
//       updateScoreUI();
//     } catch (e) {
//       console.error("Error trayendo score", e);
//     }
//   })();

//   //realtime SOLO para estado del room
//   listenToRoom(rtdbRoomId, (state) => {
//     if (!state) {
//       console.warn("Room state null");
//       return;
//     }
//     updatePlayersUI(state);
//     updateStatusUI(state);
//   });

//   startBtn.addEventListener("click", () => {
//     params.goTo(`/juego?roomId=${roomId}&rtdbRoomId=${rtdbRoomId}`);
//   });

//   return div;
// }
