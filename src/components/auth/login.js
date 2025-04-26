import Swal from 'sweetalert2';
import MicroModal from 'micromodal';
let globalModalState = {
  // Usamos un Set para almacenar los IDs de los modales VISUALMENTE abiertos.
  // Es más eficiente para añadir/eliminar y asegurar IDs únicos.
  visuallyOpen: new Set()
};

// --- Funciones para interactuar con el estado ---
window.getVisuallyOpenModals = () => new Set(globalModalState.visuallyOpen); // Devuelve una copia
window.isModalVisuallyOpen = (id) => globalModalState.visuallyOpen.has(id);
document.addEventListener('DOMContentLoaded', async function() {
    const loginForm = document.querySelector('login-form');
    console.log("loginForm", loginForm);
    if (window.microModalInitialized) {
      return;
    }
    window.microModalInitialized = true;
    const options = {
      onShow: modal => {
        console.info(`${modal.id} mostrado (evento onShow)`);
        // --- Actualizar Estado Global al Mostrar ---
        globalModalState.visuallyOpen.add(modal.id); // Añadir al Set
        console.log('Estado Global - Modales Visibles:', [...globalModalState.visuallyOpen]); // Convertir a Array para mostrar
  
        // >>> ¡ADVERTENCIA! <<<
        // Aunque múltiples IDs puedan estar en `visuallyOpen`,
        // MicroModal internamente SOLO gestionará activamente este último `modal.id`.
        // Puedes guardar cuál es el último mostrado si necesitas esa info específica:
        globalModalState.lastShown = modal.id;
        console.log('Estado Global - Último modal mostrado (gestionado activamente):', globalModalState.lastShown);
      },
      onClose: modal => {
        console.info(`${modal.id} cerrado (evento onClose)`);
        const wasPresent = globalModalState.visuallyOpen.delete(modal.id); // Eliminar del Set
        if (wasPresent) {
          console.log('Estado Global - Modales Visibles:', [...globalModalState.visuallyOpen]);
        } else {
          console.warn(`Se intentó cerrar ${modal.id}, pero no estaba registrado como visible en el Set.`);
        }
  
        if (globalModalState.lastShown === modal.id) {
           globalModalState.lastShown = globalModalState.visuallyOpen.values().next().value; // O podrías intentar deducir el "anterior", pero es frágil.
           console.log('Estado Global - Último modal mostrado ahora es:', globalModalState.lastShown);
           if (globalModalState.lastShown ){
             MicroModal.show(globalModalState.lastShown,options);
           }
        }
  
  
        document.dispatchEvent(new CustomEvent('modalstatechanged', {
          detail: { state: globalModalState }
        }));
      },
      openTrigger: 'data-micromodal-trigger',
      closeTrigger: 'data-micromodal-close',
      disableScroll: true,
      disableFocus: false, // ¡Esencial mantenerlo!
      awaitOpenAnimation: false,
      awaitCloseAnimation: false,
      debugMode: true
    }
    if (loginForm) {
        loginForm.addEventListener('login-success', (e) => {
            const detail = e.detail;
            console.log('Login exitoso:', detail.message);
            Swal.fire({
                position: "center",
                icon: "success",
                title: detail.message || "¡Sesión iniciada!",
                text: "Ahora puedes iniciar sesión.",
                showConfirmButton: true,
                customClass: {
                  popup: 'mobile-swal-popup',
                  container: 'mobile-swal-container'
                }
              }).then((result) => {
                if (result.isConfirmed) {
                  window.location.href = "/";
                }
              });
              
        });
        loginForm.addEventListener('recuperar',(e)=>{
          console.log("recuperar")
           MicroModal.show('modal-1',options);
          const modal = document.querySelector('#modal-1');
          console.log("modal", modal);
          MicroModal.show('notification1',options);
        })
    }
/*
    console.log("localStorage.getItem('token')", localStorage.getItem("token"));
    console.log("localStorage.getItem('user')", localStorage.getItem("user"));
     if (localStorage.getItem("token") && localStorage.getItem("user")) {
        console.log("Usuario ya logueado, navegando a /", localStorage.getItem("user"), localStorage.getItem("token"));
        window.location.href = "/";
    } 
*/
});