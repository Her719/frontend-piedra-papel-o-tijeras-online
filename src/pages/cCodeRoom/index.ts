import { joinRoom, markOnline, listenToRoomChanges } from "../../state";

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
        <!-- Nombre (auto guardado) -->
        <name-form></name-form>

        <!-- Código de sala -->
        <room-code-form id="code-form"></room-code-form>
      </div>

      <img-juego mode="static"></img-juego>
    </div>
  `;
  const codeForm = div.querySelector("#code-form");
  codeForm?.addEventListener("submit-code", async (e: Event) => {
    const { code } = (e as CustomEvent).detail;

    //OBTENER NOMBRE
    const name = localStorage.getItem("userName");
    if (!name) {
      alert("Primero ingresá tu nombre");
      return;
    }

    try {
      //AUTENTICACIÓN/SIGNUP (IGUAL QUE EN signIn.ts)
      let res = await fetch("http://localhost:3000/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      let data = await res.json();

      // Si no existe, crear usuario
      if (!data.exists) {
        res = await fetch("http://localhost:3000/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        data = await res.json();
      }

      const userId = data.id;

      //GUARDAR EN LOCALSTORAGE
      localStorage.setItem("userId", userId);
      localStorage.setItem("userName", name);

      //AHORA SÍ UNIRSE A ROOM
      const resp = await joinRoom(code, userId);
      const rtdbRoomId = resp.rtdbRoomId;

      //Marcar online
      await markOnline(rtdbRoomId, userId);

      //Listener realtime
      listenToRoomChanges(rtdbRoomId, code, userId);

      //Navegar a waiting
      params.goTo(`/to-room?roomId=${code}&rtdbRoomId=${rtdbRoomId}`);
    } catch (error) {
      console.error("Error al unirse a sala:", error);
      alert("No se pudo unir a la sala. Verificá el código.");
    }
  });

  return div;
}
