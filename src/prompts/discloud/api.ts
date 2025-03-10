import inquirer from "inquirer";
import { API_LOCALES } from "../../services/discloud/constants";
import { tokenIsDiscloudJwt } from "../../services/discloud/utils";
import { promptTrier } from "../utils";

export async function promptApiToken(): Promise<string> {
  return promptTrier(() => inquirer.prompt({
    type: "password",
    name: "answer",
    message: "Your Discloud token:",
    mask: true,
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

export async function promptUserLocale(): Promise<string> {
  return promptTrier(() => inquirer.prompt({
    type: "select",
    name: "answer",
    message: "Choose your locale",
    choices: API_LOCALES,
  }));
}
