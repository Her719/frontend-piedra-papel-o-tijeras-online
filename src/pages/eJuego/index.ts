// import { getRoomScore, listenToRoom, playMove } from "../../state";
// const LS_KEY = "userId";

// function roomIdFromHash() {
//   const qs = location.hash.split("?")[1] || "";
//   return new URLSearchParams(qs).get("roomId");
// }

// export function initJuego({ goTo }: { goTo: (path: string) => void }) {
//   const root = document.createElement("div");
//   root.className = "page juego";

//   const roomId = roomIdFromHash();
//   if (!roomId) {
//     root.textContent = "roomId missing";
//     return root;
//   }

//   const userId = localStorage.getItem(LS_KEY);
//   if (!userId) {
//     goTo("/sign-in");
//     return root;
//   }

//   const header = document.createElement("div");
//   header.className = "game-header";
//   header.textContent = `Sala: ${roomId}`;

//   const scoreCmp = document.createElement("game-score");
//   scoreCmp.className = "game-score";

//   const imgJuego = document.createElement("img-juego");
//   imgJuego.className = "img-juego";

//   const timer = document.createElement("timer-game");
//   timer.className = "timer-game";

//   const err = document.createElement("div");
//   err.className = "error";
//   err.style.color = "crimson";

//   root.append(header, scoreCmp, imgJuego, timer, err);

//   let rtdbRoomId: string | null = null;
//   let hasPlayed = false;

//   async function init() {
//     try {
//       // get rtdbRoomId via GET /rooms/:roomId
//       const roomDoc = await fetch(`/rooms/${roomId}`).then((r) => r.json());
//       rtdbRoomId = roomDoc?.rtdbRoomId || null;

//       // load persistent score
//       try {
//         const score = await getRoomScore(roomId);
//         scoreCmp.setAttribute("player1", score?.rounds?.[0]?.player1Id || "P1");
//         scoreCmp.setAttribute("player2", score?.rounds?.[0]?.player2Id || "P2");
//         (scoreCmp as any).scoreData = score;
//       } catch {
//         // ignore
//       }

//       if (!rtdbRoomId) {
//         err.textContent = "RTDB room id no disponible.";
//         return;
//       }

//       listenToRoom(rtdbRoomId, (data) => {
//         // update UI flags
//         const p1Move = data?.moves?.player1;
//         const p2Move = data?.moves?.player2;
//         const meSlot =
//           data?.players?.player1?.id === userId ? "player1" : "player2";
//         if (
//           (meSlot === "player1" && p1Move) ||
//           (meSlot === "player2" && p2Move)
//         ) {
//           hasPlayed = true;
//           imgJuego.setAttribute("disabled", "true");
//         } else {
//           hasPlayed = false;
//           imgJuego.removeAttribute("disabled");
//         }
//       });
//     } catch (e: any) {
//       err.textContent = e?.message || "Error inicializando juego.";
//     }
//   }

//   imgJuego.addEventListener("choice", async (ev: Event) => {
//     err.textContent = "";
//     const move = (ev as CustomEvent).detail?.move;
//     if (!move) return;
//     if (!rtdbRoomId) {
//       err.textContent = "No disponible la sala en tiempo real.";
//       return;
//     }
//     if (hasPlayed) {
//       err.textContent = "Ya jugaste esta ronda.";
//       return;
//     }
//     try {
//       imgJuego.setAttribute("disabled", "true");
//       await playMove(rtdbRoomId, userId!, move);
//       hasPlayed = true;
//     } catch (e: any) {
//       err.textContent = e?.message || "Error enviando jugada.";
//       imgJuego.removeAttribute("disabled");
//     }
//   });

//   timer.addEventListener("timeout", async (ev: Event) => {
//     if (!rtdbRoomId) return;
//     if (hasPlayed) return;
//     const autoMove = (ev as CustomEvent).detail?.move || "none";
//     try {
//       await playMove(rtdbRoomId, userId!, autoMove);
//       hasPlayed = true;
//     } catch (e: any) {
//       err.textContent = e?.message || "Error al enviar jugada por timeout.";
//     }
//   });

//   init();
//   return root;
// }
