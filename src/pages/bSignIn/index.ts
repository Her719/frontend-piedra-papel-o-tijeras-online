import { createRoom, markOnline, listenToRoomChanges } from "../../state";
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
  const nameForm = div.querySelector<HTMLElement>("#user-form");
  const continueBtn = div.querySelector<HTMLButtonElement>("#continue-btn");
  continueBtn?.addEventListener("click", async () => {
    const name = localStorage.getItem("userName");
    if (!name) {
      alert("Ingresá tu nombre");
      return;
    }
    try {
      // auth
      let res = await fetch("http://localhost:3000/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      let data = await res.json();
      // signup si no existe
      if (!data.exists) {
        res = await fetch("http://localhost:3000/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        data = await res.json();
      }
      const userId = data.id;
      //persistencia correcta
      localStorage.setItem("userId", userId);
      localStorage.setItem("userName", name);
      //crear room
      const roomResp = await createRoom(userId);
      const { roomId, rtdbRoomId } = roomResp;
      //online
      await markOnline(rtdbRoomId, userId);
      //listener
      listenToRoomChanges(rtdbRoomId, roomId, userId);
      //navegar con params correctos
      params.goTo(`/to-room?roomId=${roomId}&rtdbRoomId=${rtdbRoomId}`);
    } catch (err) {
      console.error(err);
      alert("Error al autenticar");
    }
  });
  return div;
}
