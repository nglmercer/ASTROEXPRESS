import Swal from "sweetalert2";

document.addEventListener('DOMContentLoaded', async function() {
    const registerForm = document.querySelector('register-form');
    console.log("registerForm", registerForm);
    if (registerForm) {
        registerForm.addEventListener('register-success', (e) => {
            const detail = e.detail;
            console.log('Registro exitoso:', detail.message);
            if (detail.data && detail.token) {
                localStorage.setItem("user", JSON.stringify(detail.data));
                localStorage.setItem("token", detail.token);
            }
            Swal.fire({
                position: "center",
                icon: "success",
                title: detail.message || "¡Registro completado con éxito!",
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
    }
    if (localStorage.getItem("token") && localStorage.getItem("user")) {
        console.log("Usuario ya logueado, navegando a /", localStorage.getItem("user"), localStorage.getItem("token"));
        window.location.href = "/";
    }
});
