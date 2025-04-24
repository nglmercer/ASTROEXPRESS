import { LoginModel } from "./usermodel/login.js";
import { RegisterModel } from "./usermodel/register.js";
import authService  from "./usermodel/jwt.js";
const loginModel = new LoginModel();
const registerModel = new RegisterModel();

async function main() {
  const result = await loginModel.iniciarSesion({
    apodoUsuario: "test1234",
    correoUsuario: "test1234@gmail.com",
    claveUsuario: "123456"
  });
  console.log("verificamos que existe", result);
  
}
main();
// TEST USER 
