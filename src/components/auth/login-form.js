// src/lit/login-form.js
import { html } from 'lit'; // Only need html here, LitElement and css come from base
import { loginservice } from '@utils/fetchapi';
import { AuthFormBase } from './auth-form-base'; // Import the base class

export class LoginFormElement extends AuthFormBase { // Extend the base class

  static properties = {
    _correoUsuario: { state: true }, // Specific properties remain here
    _clave: { state: true },   // Specific properties remain here
    // message and _isSending are inherited
    // apiLoginUrl: { type: String } // Keep if needed externally
  };

  constructor() {
    super(); // Call the base class constructor
    this._correoUsuario = '';
    this._clave = '';
    // message and _isSending are initialized by the base constructor

    // Keep login-specific check and navigation logic
    if (loginservice && loginservice.isLoggedIn()) {
        console.log('Usuario ya logueado, emitiendo evento para navegar a /');
        this.dispatchE('navigate-request', { // Use inherited dispatchE
            path: '/',
            bubbles: true,
            composed: true // These are already handled by dispatchE, but keeping for clarity
        });
    }
  }

  // No need for static styles here unless adding *specific* login styles
  // static styles = css`/* login-specific styles here */`;

  // Implement base class abstract methods

  renderFormFields() {
    return html`
      <input
        type="email"
        name="email"
        placeholder="Correo electrónico"
        .value=${this._correoUsuario}
        @input=${this._handleUsuarioInput}
        ?disabled=${this._isSending}
        autocomplete="email"
        required>

      <password-field
        .value=${this._clave}
        placeholder="Contraseña"
        ?disabled=${this._isSending}
        @change=${(e) => this._clave = e.detail.value}
        @submit=${(e) => this._iniciarSesion()}
        required
      ></password-field>
      
      <p><a href="#" class="yellow" @click=${()=>this.dispatchE("recuperar")}>Recuperar contraseña</a></p>
    `;
  }

  renderSubmitButton() {
    return html`
      <button @click=${this._iniciarSesion} ?disabled=${this._isSending}>
        ${this._isSending ? 'Enviando...' : 'Entrar'}
      </button>
    `;
  }

  renderAdditionalContent() {
    return html`
      <div class="center" style="width: 100%;"> <!-- Inline style might be moved to CSS if reusable -->
        <p>¡Soy nuevo!, <a href="/registro">Registrarse</a></p>
      </div>
    `;
  }

  // Keep specific input handlers, ensuring they clear the inherited message
  _handleUsuarioInput(event) {
    this._correoUsuario = event.target.value;
    this.message = ''; // Clear inherited message
  }

  _handleClaveInput(event) {
    this._clave = event.target.value;
    this.message = ''; // Clear inherited message
  }

  async _iniciarSesion() {
    this.message = ""; // Clear inherited message
    this._isSending = true; // Update inherited state
    this._dispatchLoadingState(true); // Use inherited method

    try {
      // Login-specific validation
      if (!this._correoUsuario || !this._clave) {
        this.message = "Todos los campos son requeridos.";
        return; // Exit the try block
      }
      if (!(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(this._correoUsuario))) {
        this.message = "El correo no es valido.";
        return; // Exit the try block
      }
      if (this._clave.length < 6) {
        this.message = "La contraseña debe tener 6 digitos o más.";
        return; // Exit the try block
      }

      // Login-specific API call
      const response = await loginservice.login({ correoUsuario: this._correoUsuario, claveUsuario: this._clave });

      if (!response) { // Assuming null/undefined means failure not handled by catch
         // Handle specific API error responses if needed based on 'response' content
         console.error('Login API returned no data');
         this.message = "Credenciales inválidas o error del servidor."; // More specific error
      } else if (response && response.error) { // Assuming response might have an 'error' property
         this.message = response.error; // Display error message from API
         console.error('Login API error:', response.error);
      }
      else {
        console.log('Login exitoso:', response);
        loginservice.setTokenUser(response.token, response.user);
        // Dispatch login success and navigation events
        this.dispatchE('login-success', response); // Use inherited dispatchE
        this.dispatchE('navigate-request', { path: '/', replace: true }); // Use inherited dispatchE
      }

    } catch (error) {
      console.error('Error en iniciarSesion:', error);
      // Handle network errors or exceptions during fetch
      this.message = "Ocurrió un error de red o respuesta inesperada.";
    } finally {
      // These happen regardless of success or failure in the try block
      this._isSending = false; // Update inherited state
      this._dispatchLoadingState(false); // Use inherited method
    }
  }

  // No need for _dispatchLoadingState here, it's in the base
  // _dispatchLoadingState(isLoading) { ... }
}

if (customElements.get('login-form') === undefined) {
  customElements.define('login-form', LoginFormElement);
}