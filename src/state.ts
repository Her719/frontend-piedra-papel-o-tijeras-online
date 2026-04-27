import { nanoid as nanoidShort } from "nanoid";
import { ref, onValue, set } from "firebase/database";
import { rtdb } from "./rtdb";

const API_BASE_URL = "http://localhost:3000";

export type Move = "piedra" | "papel" | "tijera";
export type GameStatus = "waiting" | "playing" | "finished";
export interface PlayerState {
  id: string | null;
  name: string;
  online: boolean;
  start: boolean;
}
export interface PlayerMoves {
  player1: Move | null;
  player2: Move | null;
}
export interface RoomState {
  rtdbRoomId?: string;
  players: {
    player1: PlayerState;
    player2: PlayerState;
  };
  moves: PlayerMoves;
  status: GameStatus;
  score?: {
    player1: number;
    player2: number;
    empates: number;
  };
}
export interface Round {
  id?: string;
  clientRoundId?: string;
  winner: "player1" | "player2" | "empate";
  moves: PlayerMoves;
  player1Id: string;
  player2Id: string;
  timestamp: string;
}
export interface RoomScoreResponse {
  roomId: string;
  currentPlayerScore: number;
  opponentScore: number;
  empates: number;
  player1Id: string;
  player2Id: string;
  opponentName: string;
  rounds: Round[];
}

export async function postRoundResult(
  roomId: string,
  round: Omit<Round, "id"> & { clientRoundId?: string },
) {
  const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/round`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(round),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Error posting round");
  }
  return res.json();
}

//Limpiar cuando hay empate
export async function clearMoves(rtdbRoomId: string) {
  try {
    const movesRef = ref(rtdb, `/rooms/${rtdbRoomId}/moves`);
    await set(movesRef, {
      player1: null,
      player2: null,
    });
  } catch (err) {
    console.error("Error limpiando movimientos:", err);
  }
}

let lastMovesSnapshot: { p1?: Move | null; p2?: Move | null } | null = null;
export function listenToRoomChanges(
  rtdbRoomId: string,
  roomId: string,
  userId: string,
  onChange?: (state: RoomState) => void,
) {
  listenToRoom(rtdbRoomId, async (data: RoomState) => {
    if (!data || !data.moves || !data.players) {
      console.warn("Room data incompleto, esperando...", data);
      return;
    }
    const roomState = { ...data, rtdbRoomId };
    const m1 = roomState.moves.player1;
    const m2 = roomState.moves.player2;
    const currentMoves = { p1: m1, p2: m2 };
    const movesChanged =
      !lastMovesSnapshot ||
      lastMovesSnapshot.p1 !== currentMoves.p1 ||
      lastMovesSnapshot.p2 !== currentMoves.p2;
    const player1Id = roomState.players.player1.id!;
    const isPlayer1 = userId === player1Id;

    //guardar ganador (no empate)
    if (m1 && m2 && movesChanged && isPlayer1) {
      lastMovesSnapshot = currentMoves;
      const winnerKey = getWinner(m1, m2) as "player1" | "player2" | "empate";
      const player1Id = roomState.players.player1.id!;
      const player2Id = roomState.players.player2.id!;

      if (winnerKey === "empate") {
        // Si es empate, limpiar las jugadas y reintentar
        try {
          await clearMoves(rtdbRoomId);
          lastMovesSnapshot = null;
        } catch (err) {
          console.error("Error limpiando movimientos:", err);
        }
      } else {
        const roundPayload = {
          clientRoundId: nanoidShort(),
          winner: winnerKey,
          moves: { player1: m1, player2: m2 },
          player1Id,
          player2Id,
          timestamp: new Date().toISOString(),
        };
        try {
          await postRoundResult(roomId, roundPayload);
        } catch (err) {
          console.error("Error enviando ronda:", err);
          lastMovesSnapshot = null;
        }
      }
    }
    if (onChange) onChange(roomState);
  });
}

export async function getRoomScore(
  roomId: string,
  userId: string,
  limit = 20,
): Promise<RoomScoreResponse> {
  const res = await fetch(
    `${API_BASE_URL}/rooms/${roomId}/score?limit=${limit}`,
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Error fetching score");
  }
  const data: any = await res.json();

  // Obtener IDs de los jugadores
  const player1Id = data.score.player1Id || data.player1Id;
  const player2Id = data.score.player2Id || data.player2Id;

  // Determinar si el usuario actual es player1 o player2
  const isCurrentUserPlayer1 = userId === player1Id;

  // Reorganizar score desde la perspectiva del usuario actual
  const currentPlayerScore = isCurrentUserPlayer1
    ? data.score.player1
    : data.score.player2;
  const opponentScore = isCurrentUserPlayer1
    ? data.score.player2
    : data.score.player1;

  const response: RoomScoreResponse = {
    roomId: data.roomId,
    currentPlayerScore,
    opponentScore,
    empates: data.score.empates,
    player1Id,
    player2Id,
    opponentName: "",
    rounds: data.rounds,
  };

  return response;
}

export function getWinner(p1: Move, p2: Move) {
  if (p1 === p2) return "empate";
  if (
    (p1 === "piedra" && p2 === "tijera") ||
    (p1 === "papel" && p2 === "piedra") ||
    (p1 === "tijera" && p2 === "papel")
  )
    return "player1";
  return "player2";
}

export async function createRoom(userId: string) {
  const res = await fetch(API_BASE_URL + "/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  return res.json();
}

export async function joinRoom(roomId: string, userId: string) {
  const res = await fetch(API_BASE_URL + "/rooms/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomId, userId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }
  return res.json();
}

export async function markOnline(rtdbRoomId: string, userId: string) {
  await fetch(API_BASE_URL + "/rooms/online", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rtdbRoomId, userId }),
  });
}

export async function playMove(rtdbRoomId: string, userId: string, move: Move) {
  await fetch(API_BASE_URL + "/rooms/play", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rtdbRoomId, userId, move }),
  });
}

// Autenticación y registro unificados
export async function authOrSignUp(name: string) {
  try {
    let res = await fetch(`${API_BASE_URL}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    let data = await res.json();

    // Si no existe, hacer signup
    if (!data.exists) {
      res = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error en signup");
      }

      data = await res.json();
    }

    return data.id;
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : "Error en autenticación",
    );
  }
}

export function listenToRoom(
  rtdbRoomId: string,
  callback: (data: RoomState) => void,
) {
  const roomRef = ref(rtdb, `/rooms/${rtdbRoomId}`);
  onValue(roomRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
}
