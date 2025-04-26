import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', async function() {
    const loginForm = document.querySelector('login-form');
    console.log("loginForm", loginForm);
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
        })
    }
    console.log("localStorage.getItem('token')", localStorage.getItem("token"));
    console.log("localStorage.getItem('user')", localStorage.getItem("user"));
/*     if (localStorage.getItem("token") && localStorage.getItem("user")) {
        console.log("Usuario ya logueado, navegando a /", localStorage.getItem("user"), localStorage.getItem("token"));
        window.location.href = "/";
    } */
});