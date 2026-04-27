import {
  listenToRoomChanges,
  markOnline,
  getRoomScore,
  playMove,
  getWinner,
  Move,
  RoomState,
} from "../../state";
import { getHashParams } from "../../router";
import { gameHeader } from "../../components/game-header";

type PageParams = {
  goTo: (path: string) => void;
};

let lastRoundResult: any = null;

export function setLastRoundResult(result: any) {
  lastRoundResult = result;
}

export function getLastRoundResult() {
  return lastRoundResult;
}

export function initJuego(params: PageParams) {
  const div = document.createElement("div");
  const searchParams = getHashParams();
  const roomId = searchParams.get("roomId");
  const rtdbRoomId = searchParams.get("rtdbRoomId");
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || userId;

  // VALIDACIONES CRÍTICAS
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

  div.style.flex = "1";
  div.style.display = "flex";
  div.style.flexDirection = "column";

  div.innerHTML = `
    <style>
      .container {
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding: 24px;
        box-sizing: border-box;
      }

      .game-area {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 32px;
        flex: 1;
        justify-content: center;
      }

      .timer-container {
        position: relative;
        height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .moves-display {
        width: 100%;
        display: flex;
        justify-content: space-around;
        align-items: center;
        gap: 32px;
        min-height: 150px;
      }

      .player-move {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        opacity: 0.5;
        transition: opacity 0.3s ease;
      }

      .player-move.revealed {
        opacity: 1;
      }

      .player-move-label {
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }

      .player-move img {
        width: 80px;
        height: 80px;
      }
    </style>

    <game-header
      room-id="${roomId}"
      player1-name="${userName}"
      player1-score="0"
      player2-name="Esperando..."
      player2-score="0"
    ></game-header>

    <div class="container">
      <div class="game-area">
        <div class="timer-container" id="timer-container">
          <timer-game></timer-game>
        </div>

        <div id="moves-container">
          <img-juego mode="interactive"></img-juego>
        </div>

        <div class="moves-display" id="moves-display" style="display: none;">
          <div class="player-move" id="player1-move">
            <div class="player-move-label" id="player1-label">${userName}</div>
            <img id="player1-img" src="" />
          </div>
          <div class="player-move" id="player2-move">
            <div class="player-move-label" id="player2-label">Esperando...</div>
            <img id="player2-img" src="" />
          </div>
        </div>
      </div>
    </div>
  `;

  const gameHeader = div.querySelector("game-header") as any;
  const timerContainer = div.querySelector("#timer-container") as HTMLElement;
  const movesContainer = div.querySelector("#moves-container") as HTMLElement;
  const movesDisplay = div.querySelector("#moves-display") as HTMLElement;
  const player1MoveEl = div.querySelector("#player1-move") as HTMLElement;
  const player2MoveEl = div.querySelector("#player2-move") as HTMLElement;
  const player1Label = div.querySelector("#player1-label") as HTMLElement;
  const player2Label = div.querySelector("#player2-label") as HTMLElement;

  let playerSelectedMove: Move | null = null;
  let roomState: RoomState | null = null;
  let gameEnded = false;
  let isCurrentUserPlayer1 = false;
  let player1Name = userName;
  let player2Name = "Esperando...";

  // TRAER SCORE INICIAL UNA SOLA VEZ
  (async () => {
    try {
      const data = await getRoomScore(roomId, userId);
      gameHeader.updateScore({
        player1: data.currentPlayerScore,
        player2: data.opponentScore,
        empates: data.empates,
      });
    } catch (e) {
      console.error("Error trayendo score", e);
    }
  })();

  // ESCUCHAR CAMBIOS DE SALA
  listenToRoomChanges(rtdbRoomId, roomId, userId, async (state: RoomState) => {
    roomState = state;

    // DETERMINAR QUIÉN ES PLAYER1 Y PLAYER2
    isCurrentUserPlayer1 = state.players.player1.id === userId;
    player1Name = state.players.player1.name || "Jugador 1";
    player2Name = state.players.player2.name || "Jugador 2";

    // ACTUALIZAR HEADER CON NOMBRES REALES
    gameHeader.setAttribute("player1-name", player1Name);
    gameHeader.setAttribute("player2-name", player2Name);

    // ACTUALIZAR LABELS DE MOVIMIENTOS
    player1Label.textContent = player1Name;
    player2Label.textContent = player2Name;

    // ACTUALIZAR SCORE UNA SOLA VEZ
    try {
      const scoreData = await getRoomScore(roomId, userId);
      const player1Score = isCurrentUserPlayer1
        ? scoreData.currentPlayerScore
        : scoreData.opponentScore;
      const player2Score = isCurrentUserPlayer1
        ? scoreData.opponentScore
        : scoreData.currentPlayerScore;

      gameHeader.updateScore({
        player1: player1Score,
        player2: player2Score,
        empates: scoreData.empates,
      });
    } catch (e) {
      console.error("Error actualizando score:", e);
    }

    // DETECTAR CUANDO AMBOS HAN JUGADO
    if (state.moves?.player1 && state.moves?.player2 && !gameEnded) {
      handleBothPlayersReady(state);
    }
  });

  // OBTENER REFERENCIA AL img-juego ACTUAL
  function getImgJuego() {
    return div.querySelector("img-juego") as any;
  }

  // OBTENER REFERENCIA AL timer ACTUAL
  function getTimer() {
    return timerContainer.querySelector("timer-game") as HTMLElement;
  }

  // ESCUCHAR SELECCIÓN DE JUGADA
  setupMoveListener();

  function setupMoveListener() {
    const imgJuego = getImgJuego();
    if (!imgJuego) return;

    imgJuego.addEventListener("choice", (e: Event) => {
      const customEvent = e as CustomEvent<Move>;
      const move = customEvent.detail;
      playerSelectedMove = move;

      playMove(rtdbRoomId!, userId!, move).catch((err) => {
        console.error("Error enviando movimiento:", err);
      });
    });
  }

  // ESCUCHAR TIMEOUT DEL TIMER
  setupTimerListener();

  function setupTimerListener() {
    const timer = getTimer();
    if (!timer) return;

    timer.addEventListener("timeout", () => {
      if (gameEnded) return;

      if (!playerSelectedMove) {
        playerSelectedMove = "piedra";
        playMove(rtdbRoomId!, userId!, "piedra").catch((err) => {
          console.error("Error enviando movimiento automático:", err);
        });
      }
    });
  }

  function handleBothPlayersReady(state: RoomState) {
    const p1Move = state.moves.player1!;
    const p2Move = state.moves.player2!;

    const winner = getWinner(p1Move, p2Move) as
      | "player1"
      | "player2"
      | "empate";

    if (winner === "empate") {
      // REINICIAR TODO PARA NUEVA RONDA
      playerSelectedMove = null;
      gameEnded = false;

      // Limpiar y ocultar display de movimientos
      movesContainer.style.display = "flex";
      movesDisplay.style.display = "none";
      player1MoveEl.classList.remove("revealed");
      player2MoveEl.classList.remove("revealed");

      // REINICIAR img-juego completamente
      movesContainer.innerHTML = "";
      const newImgJuego = document.createElement("img-juego");
      newImgJuego.setAttribute("mode", "interactive");
      movesContainer.appendChild(newImgJuego);

      // REINICIAR timer completamente
      timerContainer.innerHTML = "";
      const newTimer = document.createElement("timer-game");
      timerContainer.appendChild(newTimer);

      // Volver a escuchar los nuevos elementos
      setupMoveListener();
      setupTimerListener();

      console.log("Empate, reiniciando ronda");
      return;
    }

    // HAY GANADOR
    gameEnded = true;
    const currentPlayerWon =
      (isCurrentUserPlayer1 && winner === "player1") ||
      (!isCurrentUserPlayer1 && winner === "player2");

    const result = {
      playerMove: isCurrentUserPlayer1 ? p1Move : p2Move,
      opponentMove: isCurrentUserPlayer1 ? p2Move : p1Move,
      result: currentPlayerWon ? "jugador" : "cpu",
      winner,
      roomId,
      rtdbRoomId,
    };

    setLastRoundResult(result);
    showBothMoves(p1Move, p2Move);

    setTimeout(() => {
      params.goTo(`/resultado?roomId=${roomId}`);
    }, 2000);
  }

  function showBothMoves(p1Move: Move, p2Move: Move) {
    const imgJuego = getImgJuego();
    if (!imgJuego) return;

    // Ocultar selector y mostrar resultados
    movesContainer.style.display = "none";
    movesDisplay.style.display = "flex";

    // Establecer imágenes
    (player1MoveEl.querySelector("#player1-img") as HTMLImageElement).src =
      imgJuego.getImageUrl(p1Move);
    (player2MoveEl.querySelector("#player2-img") as HTMLImageElement).src =
      imgJuego.getImageUrl(p2Move);

    // Revelar con animación
    setTimeout(() => {
      player1MoveEl.classList.add("revealed");
      player2MoveEl.classList.add("revealed");
    }, 100);
  }

  return div;
}
