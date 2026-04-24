import { listenToRoom, markOnline, getRoomScore } from "../../state";
import { getHashParams } from "../../router"; // Exportar la función

type PageParams = {
  goTo: (path: string) => void;
};
export function initToRoom(params: PageParams) {
  const div = document.createElement("div");
  div.className = "page waiting";
  const searchParams = getHashParams(); //Usa la función helper
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
  //estado local de score (separado del realtime)
  let score = { player1: 0, player2: 0, empates: 0 };

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
      .score {
        position: absolute;
        top: 20px;
        left: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        font-size: 18px;
        font-weight: 700;
      }
      .score-item {
        display: flex;
        justify-content: space-between;
        min-width: 180px;
        gap: 12px;
      }
      .room-code-fixed {
        position: fixed;
        top: 16px;
        right: 16px;
        font-size: 18px;
        font-weight: 800;
        letter-spacing: 3px;
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.08);
        border-radius: 8px;
      }
      .room-code {
        font-size: 64px;
        font-weight: 800;
        letter-spacing: 8px;
        margin: 10px 0;
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
    <div class="room-code-fixed">${roomId}</div>

    <div class="score">
      <div class="score-item">
        <span id="p1-name">${userName}</span>
        <span id="p1-score">0</span>
      </div>

      <div class="score-item">
        <span id="p2-name">Jugador 2</span>
        <span id="p2-score">0</span>
      </div>

      <div class="score-item">
        <span>Empates</span>
        <span id="empates">0</span>
      </div>
    </div>

    <div class="container">
      <div class="subtitle">Compartí el código</div>
      <div class="room-code">${roomId}</div>
      <div class="subtitle">Con tu contrincante</div>
      <div class="status" id="status">Esperando jugador...</div>
      <button id="start-btn" disabled>START</button>
      <img-juego mode="static"></img-juego>
    </div>
  `;
  const p1Name = div.querySelector("#p1-name")!;
  const p2Name = div.querySelector("#p2-name")!;
  const p1Score = div.querySelector("#p1-score")!;
  const p2Score = div.querySelector("#p2-score")!;
  const empatesEl = div.querySelector("#empates")!;
  const statusEl = div.querySelector("#status")!;
  const startBtn = div.querySelector("#start-btn")! as HTMLButtonElement;

  function isReady(state: any) {
    return state.players?.player1?.online && state.players?.player2?.online;
  }
  function updateScoreUI() {
    p1Score.textContent = String(score.player1);
    p2Score.textContent = String(score.player2);
    empatesEl.textContent = String(score.empates);
  }
  function updatePlayersUI(state: any) {
    if (!state?.players) return;
    //Usar name del jugador 1, o el localStorage si coincide con userId
    if (state.players.player1.id === userId) {
      p1Name.textContent = userName!;
    } else {
      p1Name.textContent = state.players.player1.name || "Jugador 1";
    }
    //Usar name del jugador 2, o el localStorage si coincide con userId
    if (state.players.player2.id === userId) {
      p2Name.textContent = userName!;
    } else {
      p2Name.textContent = state.players.player2.name || "Jugador 2";
    }
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
  //marcar online SOLO si todo es válido
  markOnline(rtdbRoomId, userId);
  //traer score UNA sola vez
  (async () => {
    try {
      const data = await getRoomScore(roomId);
      score = data.score;
      updateScoreUI();
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
    updatePlayersUI(state);
    updateStatusUI(state);
  });
  startBtn.addEventListener("click", () => {
    params.goTo(`/game?roomId=${roomId}&rtdbRoomId=${rtdbRoomId}`);
  });
  return div;
}
// function updatePlayersUI(state: any) {
//   if (!state?.players) return;

//   p1Name.textContent =
//     state.players.player1.id === userId
//       ? userName!
//       : (state.players.player1.id ?? "Jugador 1");

//   p2Name.textContent =
//     state.players.player2.id === userId
//       ? userName!
//       : (state.players.player2.id ?? "Jugador 2");
// }
