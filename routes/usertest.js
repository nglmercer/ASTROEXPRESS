import { AuthModel } from "./usermodel/auth.js";
import authService  from "./usermodel/jwt.js";
const exampleUser = {
  apodoUsuario: "test1234123",
  correoUsuario: "test1234123@gmail.com",
  claveUsuario: "123456",
}
async function main() {
  const authModel = new AuthModel();
/*   const result = await authModel.iniciarSesion({ apodoUsuario: "test1234", correoUsuario: "test1234@gmail.com", claveUsuario: "123456" });
  console.log("result", result); */
  // existe username y password
/*   const paswwordhash = await authModel.obtenerUsuario(
    "123456"
  )
  const existeUsuario = await authModel.existeUsuario({ correoUsuario: "test1234@gmail.com" });
  /// deberia ser true
  console.log("paswwordhash", paswwordhash,"existeUsuario", existeUsuario);
  // verificamos que sea correcto 
  const exactPassword = await authService.verifyPassword("123456", paswwordhash);
  console.log("exactPassword", exactPassword); */
  const resultReg = await authModel.registrarUsuario(exampleUser);
  console.log("resultReg", resultReg);
}
main();
