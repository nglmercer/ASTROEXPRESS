import { AuthModel } from "./usermodel/auth.js";
import authService  from "./usermodel/jwt.js";
const exampleUser = {
  apodoUsuario: "nglmercer",
  correoUsuario: "nglmercer@gmail.com",
  claveUsuario: "123456",
}
// path recover 
const pathlink = "/reset-password/026f691a11672196e2df6e31e9c121cc93097032d6310e535c6a442d495f57f0"
async function main() {
  const authModel = new AuthModel();
/*   const result = await authModel.iniciarSesion({ apodoUsuario: "test1234", correoUsuario: "test1234@gmail.com", claveUsuario: "123456" });
  console.log("result", result); */
  // existe username y password
  const paswwordhash = await authModel.obtenerUsuario(
    "123456"
  )
  const existeUsuario = await authModel.existeUsuario({ correoUsuario: "nglmercer@gmail.com" });
  /// deberia ser true
  console.log("paswwordhash", paswwordhash,"existeUsuario", existeUsuario);
  // verificamos que sea correcto 
  const exactPassword = await authService.verifyPassword("123456", paswwordhash);
  console.log("exactPassword", exactPassword);
/*   const resultRec = await authModel.recuperarpassword(exampleUser);
  console.log("resultRec", resultRec); */
/*   const verifycode = await authModel.verifycodePassword({path:pathlink, code:338986, password: "123456"})
  console.log("verifycode",verifycode) */

}
main();
