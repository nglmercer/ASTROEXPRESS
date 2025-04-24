import { LitElement, html, css } from "lit";
import { loginservice } from "@utils/fetchapi";
export class RegisterFormElement extends LitElement {
  static properties = {
    _usuario: { state: true },
    _clave: { state: true },
    _email: { state: true },
    message: { state: true },
    _isSending: { state: true },
    // apiLoginUrl: { type: String } // Keep if needed externally
  };

  constructor() {
    super();
    this._usuario = "";
    this._clave = "";
    this.message = "";
    this._email = "";
    this._isSending = false;
    // this.apiLoginUrl = '/usuario/sesion';

    if (localStorage.getItem("token") && localStorage.getItem("user")) {
      console.log("Usuario ya logueado, emitiendo evento para navegar a /");
      this.dispatchEvent(
        new CustomEvent("navigate-request", {
          detail: { path: "/" },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  static styles = css`
    .formLogin {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .text-shadow {
        text-shadow: 
          -1px -1px 0 gray,
          1px -1px 0 gray,
          -1px  1px 0 gray,
          1px  1px 0 gray;
      }

    .divCenter {
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      position: relative;
    }

    .formLogin .divCenter > div {
      width: 100%;
      max-width: 350px;
    }

    .formLogin input[type="text"],
    .formLogin input[type="email"],
    .formLogin input[type="password"] {
      display: block;
      width: 100% !important;
      margin: 10px 0;
      background: #280d3f !important;
      border: none;
      border-radius: 5px;
      padding: 12px 15px;
      box-sizing: border-box;
      color: white !important;
      text-align: center;
      outline: none;
    }

    .formLogin input[type="text"]::placeholder,
    .formLogin input[type="password"]::placeholder {
      color: rgba(236, 236, 236, 0.692);
      opacity: 1;
    }

    .formLogin button {
      background: #bb9517;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 3px;
      font-weight: bold;
      cursor: pointer;
      min-width: 100px;
      transition: background-color 0.2s ease;
    }

    .formLogin button:hover {
      background: #a38315;
    }

    .formLogin p {
      width: 100%;
      text-align: center;
    }

    .formLogin a {
      color: white;
      font-weight: bolder;
      cursor: pointer;
      text-decoration: underline;
    }

    .error-message {
      color: rgb(255, 36, 36);
      text-align: center;
      width: 100%;
      font-weight: bolder;
      margin-top: 10px;
      min-height: 1.2em;
    }

    .center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      width: 100%;
    }
    .max-w-80 {
      max-width: 80%;
    }
    @media (max-width: 700px) {
      .formLogin .divCenter > div {
        width: 85%;
      }

      .formLogin input[type="text"],
      .formLogin input[type="password"] {
        font-size: 1.1em;
        padding: 10px 12px;
      }

      .formLogin button {
        font-size: 1.1em;
        width: 50%;
        padding: 12px 15px;
      }
    }
  `;

  render() {
    return html`
      <form
        class="formLogin"
        slot="login-form"
        @submit=${(e) => e.preventDefault()}
        @focusin=${this._handleFormFocusIn}
        @focusout=${this._handleFormFocusOut}
      >
        <div class="divCenter">
          <div>
            <input
              type="text"
              placeholder="Nombre de Usuario"
              .value=${this._usuario}
              ?disabled=${this._isSending}
              @input=${this._handleUsuarioInput}
              required
            />

            <input
              type="email"
              placeholder="Correo electrónico"
              .value=${this._email}
              @input=${this._handleEmailInput}
              ?disabled=${this._isSending}
              required
            />

            <input
              type="password"
              placeholder="Contraseña"
              .value=${this._clave}
              @input=${this._handleClaveInput}
              ?disabled=${this._isSending}
              required
            />
          </div>
        </div>

        <div class="error-message">
          ${this.message ? html`<p>${this.message}</p>` : ""}
        </div>
        <br />

        <div class="center" style="width: 100%;">
          <button @click=${this._registrarUsuario} ?disabled=${this._isSending}>
            ${this._isSending ? "Registrando..." : "Registrarse"}
          </button>
        </div>
        <br />

        <div class="center" style="width: 100%;">
          <p class="text-shadow max-w-80">
            Al registrarte aceptas los terminos y condiciones que puedes verlos
            aquí.
          </p>
          <button @click=${this._terminos}>
              "Terminos y condiciones"
          </button>
        </div>

        <div class="center" style="width: 100%;">
          <p>
            ¡Ya tengo cuenta!,
            <a href="/login">Iniciar sesión</a>
          </p>
        </div>
      </form>
    `;
  }

  _handleFormFocusIn(event) {
    this.dispatchEvent(
      new CustomEvent("form-focusin", {
        bubbles: true,
        composed: true,
      })
    );
  }

  _handleFormFocusOut(event) {
    const relatedTarget = event.relatedTarget;
    if (!relatedTarget || !this.shadowRoot.contains(relatedTarget)) {
      this.dispatchEvent(
        new CustomEvent("form-focusout", {
          bubbles: true,
          composed: true,
        })
      );
    } else {
      console.log(
        "Focus se movió a otro elemento dentro del componente del formulario."
      );
    }
  }

  _handleUsuarioInput(event) {
    this._usuario = event.target.value;
    this.message = "";
  }

  _handleClaveInput(event) {
    this._clave = event.target.value;
    this.message = "";
  }
  _handleEmailInput(event) {
    this._email = event.target.value;
    this.message = "";
  }
  _navegarARegistro(event) {
    event.preventDefault();
    console.log("Solicitando navegación a /registro");
    this.dispatchEvent(
      new CustomEvent("navigate-request", {
        detail: { path: "/registro" },
        bubbles: true,
        composed: true,
      })
    );
  }
  getregisterData(){
    return {
      apodoUsuario: this._usuario,
      claveUsuario: this._clave,
      correoUsuario: this._email, // Añadir email al cuerpo de la solicitud
    }
  }
  async _registrarUsuario() {
    this.message = "";
    this._isSending = true;
    this._dispatchLoadingState(true);

    try {
      // Validación: Incluir email y verificar todos los campos
      if (!this._usuario || !this._clave || !this._email) {
        this.message = "Todos los campos son requeridos.";
        this._isSending = false;
        this._dispatchLoadingState(false);
        return;
      }
      // Validación: Corregir la validación de email para usar this._email
      if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(this._email)) {
        this.message = "El formato del correo electrónico no es válido.";
        this._isSending = false;
        this._dispatchLoadingState(false);
        return;
      }
      if (this._clave.length < 6) {
        this.message = "La contraseña debe tener 6 digitos o más.";
        this._isSending = false;
        this._dispatchLoadingState(false);
        return;
      }
      const registerData = this.getregisterData();
      // Endpoint de Registro (Asumiendo)
      const localEndpoint = 'http://localhost:8080/';
      const apiServer = 'https://api.koinima.com/';
      const apiEndpoint = apiServer  + 'usuario/registro';
      console.log("Enviando datos de registro a:", apiEndpoint);

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Mantener manejo de errores del servidor
        this.message =
        result.message || `Error ${response.status}: ${response.statusText}`;
      } else {
        // Lógica de éxito para Registro
        console.log("Registro exitoso:", result);

        // Disparar evento de registro exitoso (si es necesario)
        this.dispatchEvent(
          new CustomEvent("register-success", {
            detail: { message: result.message || "Registro exitoso", data: result.data, token: result.token },
            bubbles: true,
            composed: true,
          })
        );
/*         this._usuario = "";
        this._email = "";
        this._clave = ""; */

      }
    } catch (error) {
      console.error("Error en _registrarUsuario:", error); // Actualizar contexto del error
      this.message = "Ocurrió un error de red o al procesar la solicitud."; // Mensaje de error más específico
    } finally {
      this._isSending = false;
      this._dispatchLoadingState(false);
    }
  }
  _terminos(e) {
    e.preventDefault();
    window.location.href = "/tyc";
    this.dispatchEvent(new CustomEvent("terminos"));
  }
  _dispatchLoadingState(isLoading) {
    this.dispatchEvent(
      new CustomEvent("loading-state", {
        detail: { loading: isLoading },
        bubbles: true,
        composed: true,
      })
    );
  }
}

if (customElements.get("register-form") === undefined) {
  customElements.define("register-form", RegisterFormElement);
}
