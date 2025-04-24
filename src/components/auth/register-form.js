// src/lit/register-form.js
import { html } from "lit"; // Need html and css here
import { loginservice } from "@utils/fetchapi";
import { AuthFormBase } from "./auth-form-base"; // Import the base class

export class RegisterFormElement extends AuthFormBase { // Extend the base class
  static properties = {
    _usuario: { state: true }, // Specific properties remain here
    _clave: { state: true },   // Specific properties remain here
    _email: { state: true },    // Specific properties remain here
    // message and _isSending are inherited
  };

  constructor() {
    super(); // Call the base class constructor
    this._usuario = "";
    this._clave = "";
    this._email = "";
    // message and _isSending are initialized by the base constructor
  }

  // Add register-specific styles. These will be merged with base styles.

  // Implement base class abstract methods

  renderFormFields() {
    return html`
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

      <password-field
        .value=${this._clave}
        placeholder="Contraseña"
        ?disabled=${this._isSending}
        @change=${(e) => this._clave = e.detail.value}
        required
      ></password-field>
    `;
  }

  renderSubmitButton() {
    return html`
      <button @click=${this._registrarUsuario} ?disabled=${this._isSending}>
        ${this._isSending ? "Registrando..." : "Registrarse"}
      </button>
    `;
  }

  renderAdditionalContent() {
    return html`
      <div class="center max-w-80"> <!-- Use max-w-80 class if kept specific -->
        <p class="text-shadow"> <!-- Use text-shadow class if kept specific -->
          Al registrarte aceptas los terminos y condiciones que puedes verlos
          aquí.
        </p>
        <button @click=${this._terminos}>
            "Terminos y condiciones"
        </button>
      </div>

      <div class="center" style="width: 100%;"> <!-- Inline style might be moved to CSS if reusable -->
        <p>
          ¡Ya tengo cuenta!,
          <a href="/login" >Iniciar sesión</a>
        </p>
      </div>
    `;
  }


  // Keep specific input handlers, ensuring they clear the inherited message
  _handleUsuarioInput(event) {
    this._usuario = event.target.value;
    this.message = ""; // Clear inherited message
  }

  _handleClaveInput(event) {
    this._clave = event.target.value;
    this.message = ""; // Clear inherited message
  }

  _handleEmailInput(event) {
    this._email = event.target.value;
    this.message = ""; // Clear inherited message
  }

  // Keep specific data preparation
  getregisterData(){
    return {
      apodoUsuario: this._usuario,
      claveUsuario: this._clave,
      correoUsuario: this._email,
    }
  }

  // Keep specific registration logic
  async _registrarUsuario() {
    this.message = ""; // Clear inherited message
    this._isSending = true; // Update inherited state
    this._dispatchLoadingState(true); // Use inherited method

    try {
      // Register-specific validation
      if (!this._usuario || !this._clave || !this._email) {
        this.message = "Todos los campos son requeridos.";
        return; // Exit the try block
      }
      if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(this._email)) {
        this.message = "El formato del correo electrónico no es válido.";
        return; // Exit the try block
      }
      if (this._clave.length < 6) {
        this.message = "La contraseña debe tener 6 digitos o más.";
        return; // Exit the try block
      }

      const registerData = this.getregisterData();

      // Register-specific API call
      const response = await loginservice.register(registerData);

      if (!response) { // Assuming null/undefined means failure not handled by catch
         console.error('Register API returned no data or generic error');
         this.message = "Error al registrar usuario. Inténtalo de nuevo.";
      } else if (response.error) { // Assuming API might return an 'error' property on failure
         this.message = response.error; // Display error message from API
         console.error('Register API error:', response.error);
      }
      else {
        console.log("Registro exitoso:", response);
        // Optional: Clear fields on success
        this._usuario = "";
        this._email = "";
        this._clave = "";
        this.message = "Registro exitoso! Ahora puedes iniciar sesión."; // Success message

        // Dispatch registration success event
        this.dispatchE('registration-success', response); // Use inherited dispatchE

        // Optionally navigate to login after success
        // this.dispatchE('navigate-request', { path: '/login', replace: true });
      }

    } catch (error) {
      console.error("Error en _registrarUsuario:", error);
      // Handle network errors or exceptions during fetch
      this.message = "Ocurrió un error de red o al procesar la solicitud.";
    } finally {
      // These happen regardless of success or failure in the try block
      this._isSending = false; // Update inherited state
      this._dispatchLoadingState(false); // Use inherited method
    }
  }

  _terminos(e) {
    e.preventDefault();
    // window.location.href = "/tyc"; // Prefer event dispatch for routing
    this.dispatchE("navigate-request", { path: '/tyc', replace: false }); // Assuming TYC might open in new tab or just navigate
    this.dispatchE("terminos", {});
  }

  // No need for _dispatchLoadingState here, it's in the base
  // _dispatchLoadingState(isLoading) { ... }

  // No need for _handleFormFocusIn, _handleFormFocusOut, dispatchE here, they are in the base
}

if (customElements.get("register-form") === undefined) {
  customElements.define("register-form", RegisterFormElement);
}