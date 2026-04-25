import { listenToRoom, markOnline, getRoomScore } from "../../state";
import { getHashParams } from "../../router";
type PageParams = {
  goTo: (path: string) => void;
};

export function initJuego(params: PageParams) {
  const div = document.createElement("div");
  const searchParams = getHashParams();
  const roomId = searchParams.get("roomId");
  const rtdbRoomId = searchParams.get("rtdbRoomId");
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || userId;
  div.style.flex = "1";
  div.style.display = "flex";
  let score = { player1: 0, player2: 0, empates: 0 };

  div.innerHTML = `
    <style>
      .conteiner {
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
      }

    </style>
    
    <div class="conteiner">
        <game-header
        room-id="${roomId}"
        player1-name="${userName}"
        player1-score="0"
        player2-name="Jugador 2"
        player2-score="0"
        empates="0"
        ></game-header>

      <timer-game></timer-game>
      <img-juego mode="interactive"></img-juego>
    </div>
  `;

  const timer = div.querySelector("timer-game");
  const imgJuego = div.querySelector("img-juego");

  timer?.addEventListener("timeout", () => {
    const lastRound = 0;
    if (!lastRound) return;

    // mostrar jugadas finales
    // imgJuego?.setAttribute("mode", "static");
    // imgJuego?.setAttribute("player", lastRound.playerMove);
    // imgJuego?.setAttribute("cpu", lastRound.cpuMove);

    // pequeño delay para que se vea la jugada de la cpu y jugador
    setTimeout(() => {
      params.goTo("/resultado");
    }, 1500);
  });

  return div;
}
