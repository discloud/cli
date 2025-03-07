import inquirer from "inquirer";
import { tokenIsDiscloudJwt } from "../../services/discloud/utils";
import { promptTrier } from "../utils";

export async function promptApiToken() {
  return promptTrier(() => inquirer.prompt({
    type: "password",
    name: "answer",
    message: "Your Discloud token:",
    validate: tokenIsDiscloudJwt,
  }));
}
