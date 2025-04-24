import { LoginModel } from "./usermodel/login.js";
import { RegisterModel } from "./usermodel/register.js";

const loginModel = new LoginModel();
const registerModel = new RegisterModel();

async function main() {
  const result = await loginModel.iniciarSesion("admin1", "1234");
  console.log("result", result);
}
main();