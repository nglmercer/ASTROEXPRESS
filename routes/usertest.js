import { AuthModel } from "./usermodel/auth.js";
import authService  from "./usermodel/jwt.js";
const exampleUser = {
  apodoUsuario: "nglmercer",
  correoUsuario: "nglmercer@gmail.com",
  claveUsuario: "1234567",
}
// path recover 
const pathlink = "/reset-password/e9c8d58bec4cf2928eace9994bdad999579dae0c2b0fc82ab8e077b7b3d6341f"
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
/*   const resultRec = await authModel.recuperarpassword(exampleUser);
  console.log("resultRec", resultRec); */
  const verifycode = await authModel.verifycodePassword({path:pathlink, code:383069, password: "123456"})
  console.log("verifycode",verifycode)
}
main();
