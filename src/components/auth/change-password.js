import { html } from 'lit'; // Only need html here, LitElement and css come from base
import { loginservice } from '@utils/fetchapi';
import { AuthFormBase } from './auth-form-base'; // Import the base class
export class ChangePasswordForm extends AuthFormBase {
    static properties = {
        _newpassword: { state: true }, // Specific properties remain here
        _confirmPassword: { state: true },   // Specific properties remain here
      };
    constructor() {
        super();
        this._newpassword = '';
        this._confirmPassword = '';
    }
    renderFormFields() {
        return html `
          <password-field
        .value=${this._newpassword}
        placeholder="Contraseña"
        ?disabled=${this._isSending}
        @change=${(e) => this._newpassword = e.detail.value}
        @submit=${(e) => this._changePassword()}
        required
      ></password-field>

      <password-field
        .value=${this._confirmPassword}
        placeholder="Contraseña"
        ?disabled=${this._isSending}
        @change=${(e) => this._confirmPassword = e.detail.value}
        @submit=${(e) => this._changePassword()}
        required
      ></password-field>
        `;
    }
    _changePassword() {
        this.message = ""; // Clear inherited message
        this._isSending = true; // Update inherited state
        this._dispatchLoadingState(true); // Use inherited method
        try {
            // Login-specific validation
            if (!this._newpassword || !this._confirmPassword) {
                this.message = "Todos los campos son requeridos.";
                return; // Exit the try block
            }
            if (this._newpassword !== this._confirmPassword) {
                this.message = "Las contraseñas no coinciden.";
                return; // Exit the try block
            }
            if (this._newpassword.length < 6) {
                this.message = "La contraseña debe tener 6 digitos o más.";
                return; // Exit the try block
            }
            this.dispatchE("submit",{
                newpassword: this._newpassword,
                confirmpassword: this._confirmPassword
            })
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

}
customElements.define("change-password-form", ChangePasswordForm);