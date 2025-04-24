// src/lit/login-container.js
import { LitElement, html, css } from 'lit';
import { loginservice } from '@utils/fetchapi';
export class LoginFormElement extends LitElement {

  static properties = {
    _usuario: { state: true },
    _clave: { state: true },
    message: { state: true },
    _isSending: { state: true },
    // apiLoginUrl: { type: String } // Keep if needed externally
  };

  constructor() {
    super();
    this._usuario = '';
    this._clave = '';
    this.message = '';
    this._isSending = false;
    // this.apiLoginUrl = '/usuario/sesion';

    if (loginservice && loginservice.isLoggedIn()) {
        console.log('Usuario ya logueado, emitiendo evento para navegar a /');
        this.dispatchEvent(new CustomEvent('navigate-request', {
            detail: { path: '/' },
            bubbles: true,
            composed: true
        }));
    }
  }

  static styles = css`
    .formLogin {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
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
    .formLogin input[type="password"] {
      display: block;
      width: 100% !important;
      margin: 10px 0;
      background: #280D3F !important;
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
              placeholder="Correo electrónico"
              .value=${this._usuario}
              @input=${this._handleUsuarioInput}
              ?disabled=${this._isSending}
              required>

            <input
              type="password"
              placeholder="Contraseña"
              .value=${this._clave}
              @input=${this._handleClaveInput}
              ?disabled=${this._isSending}
              required>
          </div>
        </div>

        <div class="error-message">
          ${this.message ? html`<p>${this.message}</p>` : ''}
        </div>
        <br>

        <div class="center" style="width: 100%;">
          <button @click=${this._iniciarSesion} ?disabled=${this._isSending}>
            ${this._isSending ? 'Enviando...' : 'Entrar'}
          </button>
        </div>
        <br>

        <div class="center" style="width: 100%;">
          <p>¡Soy nuevo!, <a href="/register" @click=${this._navegarARegistro}>Registrarse</a></p>
        </div>
      </form>
    `;
  }

  _handleFormFocusIn(event) {
    this.dispatchEvent(new CustomEvent('form-focusin', {
      bubbles: true,
      composed: true
    }));
  }

  _handleFormFocusOut(event) {
    const relatedTarget = event.relatedTarget;
    if (!relatedTarget || !this.shadowRoot.contains(relatedTarget)) {
      this.dispatchEvent(new CustomEvent('form-focusout', {
        bubbles: true,
        composed: true
      }));
    } else {
      console.log('Focus se movió a otro elemento dentro del componente del formulario.');
    }
  }

  _handleUsuarioInput(event) {
    this._usuario = event.target.value;
    this.message = '';
  }

  _handleClaveInput(event) {
    this._clave = event.target.value;
    this.message = '';
  }

  _navegarARegistro(event) {
    event.preventDefault();
    window.location.href = "/registro";
    console.log('Solicitando navegación a /registro');
    this.dispatchEvent(new CustomEvent('navigate-request', {
      detail: { path: '/registro' },
      bubbles: true,
      composed: true
    }));
  }

  async _iniciarSesion() {
    this.message = "";
    this._isSending = true;
    this._dispatchLoadingState(true);

    try {
      if (!this._usuario || !this._clave) {
        this.message = "Todos los campos son requeridos.";
        this._isSending = false;
        this._dispatchLoadingState(false);
        return;
      }
      if (!(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(this._usuario))) {
        this.message = "El correo no es valido.";
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


      const response = await loginservice.login({ usuarioUsuario: this._usuario, claveUsuario: this._clave });

      if (!response) {
        console.error('Error en iniciarSesion:', response);
      } else {
        console.log('Login exitoso:', response);

        this.dispatchEvent(new CustomEvent('login-success', {
          detail: response,
          bubbles: true, composed: true
        }));

        this.dispatchEvent(new CustomEvent('navigate-request', {
          detail: { path: '/', replace: true },
          bubbles: true, composed: true
        }));

      }

    } catch (error) {
      console.error('Error en iniciarSesion:', error);
      this.message = "Ocurrió un error de red o respuesta inesperada.";
    } finally {
      this._isSending = false;
      this._dispatchLoadingState(false);
    }
  }

  _dispatchLoadingState(isLoading) {
    this.dispatchEvent(new CustomEvent('loading-state', {
      detail: { loading: isLoading },
      bubbles: true,
      composed: true
    }));
  }
}

if (customElements.get('login-form') === undefined) {
  customElements.define('login-form', LoginFormElement);
}