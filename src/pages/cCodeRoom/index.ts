import {
  joinRoom,
  markOnline,
  listenToRoomChanges,
  authOrSignUp,
} from "../../state";

type PageParams = {
  goTo: (path: string) => void;
};

export function initCodeRoom(params: PageParams) {
  const div = document.createElement("div");
  div.className = "page code-room";
  div.innerHTML = `
    <style>
      .container {
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 24px;
        padding: 24px;
        box-sizing: border-box;
      }

      .form-section {
        width: 100%;
        max-width: 420px;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .titulo-game {
        width: 308px;
        height: 219px;
        display: inline-block;
      }
    </style>
    <div class="container">
      <text-game>
        <span class="titulo-game" slot="titulo">
          Piedra, Papel o Tijera
        </span>
      </text-game>

      <div class="form-section">
        <name-form></name-form>
        <room-code-form id="code-form"></room-code-form>
      </div>

      <img-juego mode="static"></img-juego>
    </div>
  `;

  const codeForm = div.querySelector("#code-form");

  codeForm?.addEventListener("submit-code", async (e: Event) => {
    const { code } = (e as CustomEvent).detail;
    const name = localStorage.getItem("userName");

    if (!name) {
      alert("Primero ingresá tu nombre");
      return;
    }

    try {
      // Autenticación unificada (auth + signup)
      const userId = await authOrSignUp(name);

      // Persistencia
      localStorage.setItem("userId", userId);
      localStorage.setItem("userName", name);

      // Unirse a la room
      const resp = await joinRoom(code, userId);
      const { rtdbRoomId } = resp;

      // Marcar online
      await markOnline(rtdbRoomId, userId);

      // Escuchar cambios realtime
      listenToRoomChanges(rtdbRoomId, code, userId);

      // Navegar
      params.goTo(`/to-room?roomId=${code}&rtdbRoomId=${rtdbRoomId}`);
    } catch (error) {
      console.error("Error al unirse a sala:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo unir a la sala. Verificá el código.",
      );
    }
  });

  return div;
}
