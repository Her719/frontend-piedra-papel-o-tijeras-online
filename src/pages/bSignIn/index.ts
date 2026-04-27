import {
  createRoom,
  markOnline,
  listenToRoomChanges,
  authOrSignUp,
} from "../../state";

type PageParams = {
  goTo: (path: string) => void;
};

export function initSignIn(params: PageParams) {
  const div = document.createElement("div");
  div.className = "page sign-in";
  div.innerHTML = `
    <style>
      .titulo-game {
        width: 308px;
        height: 219px;
        display: inline-block;
      }
      .container {
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 24px;
        box-sizing: border-box;
        padding: 24px;
      }
      .form-section {
        width: 100%;
        max-width: 420px;
        display:flex;
        flex-direction:column;
        gap:16px;
      }
      .continue-btn {
        width:100%;
        height:74px;
        font-size:28px;
        color:#D8FCFC;
        background:#0078FF;
        border:10px solid #001997;
        border-radius:12px;
        cursor:pointer;
        font-family: 'Odibee Sans', sans-serif;
      }
    </style>
    <div class="container">
      <text-game>
        <span class="titulo-game" slot="titulo">Piedra, Papel o Tijera</span>
      </text-game>
      <div class="form-section">
        <name-form id="user-form"></name-form>

        <button class="continue-btn" id="continue-btn">
          Continuar
        </button>
      </div>
      <img-juego mode="static"></img-juego>
    </div>
  `;

  const continueBtn = div.querySelector<HTMLButtonElement>("#continue-btn");

  continueBtn?.addEventListener("click", async () => {
    const name = localStorage.getItem("userName");

    if (!name) {
      alert("Ingresá tu nombre");
      return;
    }

    try {
      // Autenticación unificada (auth + signup si es necesario)
      const userId = await authOrSignUp(name);

      // Persistencia
      localStorage.setItem("userId", userId);
      localStorage.setItem("userName", name);

      // Crear room
      const { roomId, rtdbRoomId } = await createRoom(userId);

      // Marcar online
      await markOnline(rtdbRoomId, userId);

      // Escuchar cambios
      listenToRoomChanges(rtdbRoomId, roomId, userId);

      // Navegar
      params.goTo(`/to-room?roomId=${roomId}&rtdbRoomId=${rtdbRoomId}`);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Error al autenticar");
    }
  });

  return div;
}
