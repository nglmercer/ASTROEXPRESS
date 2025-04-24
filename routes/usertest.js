import { AuthModel } from "./usermodel/auth.js";
async function main() {
  const authModel = new AuthModel();
  const result = await authModel.iniciarSesion({ apodoUsuario: "test1234", correoUsuario: "test1234@gmail.com", claveUsuario: "123456" });
  console.log("result", result);
  // existe username y password
  const register = await authModel.registrarUsuario({
    apodoUsuario: "test1234",
    correoUsuario: "test1234@gmail.com",
    claveUsuario: "123456"
  })
  /// deberia ser true
  console.log("register", register);
}
main();
