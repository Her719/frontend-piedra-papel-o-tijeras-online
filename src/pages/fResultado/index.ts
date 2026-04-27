import { getLastRoundResult } from "../eJuego";
import { getHashParams } from "../../router";
import { getRoomScore, listenToRoom } from "../../state";
import type { RoomState } from "../../state";

type PageParams = {
  goTo: (path: string) => void;
};

export function initResultado(params: PageParams) {
  const div = document.createElement("div");
  const searchParams = getHashParams();
  const roomId = searchParams.get("roomId");
  const userId = localStorage.getItem("userId");

  // VALIDACIONES CRÍTICAS
  if (!roomId || !userId) {
    console.error("Faltan parámetros críticos");
    params.goTo("/home");
    return div;
  }

  const lastRound = getLastRoundResult();

  if (!lastRound) {
    div.innerHTML = `<p>No hay resultados</p>`;
    return div;
  }

  div.innerHTML = `
    <style>
      .container {
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
      }
    </style>

    <div class="container">
      <result-game result="${lastRound.result}">
        <div style="display: flex; flex-direction: column; gap: 16px; width: 100%; align-items: center;">
          <game-score 
            player1-name="Cargando..." 
            player1-score="0" 
            player2-name="Cargando..." 
            player2-score="0" 
            empates="0"
          ></game-score>

          <btn-component action="next">
            Jugar de nuevo
          </btn-component>
          <btn-component action="welcome">
            Inicio
          </btn-component>
        </div>
      </result-game>
    </div>
  `;

  const gameScore = div.querySelector("game-score") as any;
  const buttons = div.querySelectorAll("btn-component");

  // Obtener datos de la sala y score del servidor
  listenToRoom(lastRound.rtdbRoomId, async (state: RoomState) => {
    if (!state?.players) return;

    const player1Name = state.players.player1.name || "Jugador 1";
    const player2Name = state.players.player2.name || "Jugador 2";

    // Actualizar nombres en game-score
    gameScore.setAttribute("player1-name", player1Name);
    gameScore.setAttribute("player2-name", player2Name);

    // Traer score del servidor
    try {
      const scoreData = await getRoomScore(roomId, userId);

      // Determinar cuál player es el usuario actual
      const isCurrentUserPlayer1 = scoreData.player1Id === userId;

      // Asignar scores correctamente
      const player1Score = isCurrentUserPlayer1
        ? scoreData.currentPlayerScore
        : scoreData.opponentScore;
      const player2Score = isCurrentUserPlayer1
        ? scoreData.opponentScore
        : scoreData.currentPlayerScore;

      gameScore.updateScore({
        player1: player1Score,
        player2: player2Score,
        empates: scoreData.empates,
      });
    } catch (e) {
      console.error("Error trayendo score", e);
    }
  });

  // MANEJADORES DE BOTONES
  buttons.forEach((btn) => {
    btn.addEventListener("btn-click", (e: any) => {
      if (e.detail.action === "next") {
        params.goTo(
          `/juego?roomId=${roomId}&rtdbRoomId=${lastRound.rtdbRoomId}`,
        );
      }

      if (e.detail.action === "welcome") {
        params.goTo("/home");
      }
    });
  });

  return div;
}
