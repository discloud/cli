import inquirer from "inquirer";
import { tokenIsDiscloudJwt } from "../../services/discloud/utils";
import { promptTrier } from "../utils";

export async function promptApiToken(): Promise<string> {
  return promptTrier(() => inquirer.prompt({
    type: "password",
    name: "answer",
    message: "Your Discloud token:",
    validate: tokenIsDiscloudJwt,
  }));
}

export async function promptAppConsoleCommand(): Promise<string> {
  return promptTrier(() => inquirer.prompt({
    type: "input",
    name: "answer",
    message: ">",
    required: true,
  }));
}
