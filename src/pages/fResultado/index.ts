// import { getRoomScore, listenToRoom } from "../../state";
// const LS_KEY = "userId";

// function roomIdFromHash() {
//   const qs = location.hash.split("?")[1] || "";
//   return new URLSearchParams(qs).get("roomId");
// }

// export function initResultado({ goTo }: { goTo: (path: string) => void }) {
//   const root = document.createElement("div");
//   root.className = "page resultado";

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

//   const title = document.createElement("h2");
//   title.textContent = "Resultado";

//   const resultCmp = document.createElement("result-game");
//   const scoreCmp = document.createElement("game-score");

//   const againBtn = document.createElement("button");
//   againBtn.textContent = "Volver a jugar";

//   const backBtn = document.createElement("button");
//   backBtn.textContent = "Volver a sala";

//   const err = document.createElement("div");
//   err.className = "error";
//   err.style.color = "crimson";

//   root.append(title, resultCmp, scoreCmp, againBtn, backBtn, err);

//   async function init() {
//     try {
//       // obtener score y último round para mostrar
//       const score = await getRoomScore(roomId);
//       if (score) {
//         (scoreCmp as any).scoreData = score;
//         if (score.rounds && score.rounds.length) {
//           (resultCmp as any).data = score.rounds[0];
//         }
//       }
//       // escuchar RTDB para mantenerse actualizado si se quieren cambios
//       try {
//         const roomDoc = await fetch(`/rooms/${roomId}`).then((r) => r.json());
//         const rtdbRoomId = roomDoc?.rtdbRoomId;
//         if (rtdbRoomId) {
//           listenToRoom(rtdbRoomId, () => {
//             // opcional: refrescar score
//             getRoomScore(roomId).then((s) => {
//               (scoreCmp as any).scoreData = s;
//               if (s?.rounds?.[0]) (resultCmp as any).data = s.rounds[0];
//             });
//           });
//         }
//       } catch {
//         // ignore rtdb listen errors
//       }
//     } catch (e: any) {
//       err.textContent = e?.message || "Error cargando resultado.";
//     }
//   }

//   againBtn.addEventListener("click", () => {
//     goTo(`/juego?roomId=${encodeURIComponent(roomId)}`);
//   });
//   backBtn.addEventListener("click", () => {
//     goTo(`/to-room?roomId=${encodeURIComponent(roomId)}`);
//   });

//   init();
//   return root;
// }
