import { input, password, select } from "@inquirer/prompts";
import { API_LOCALES } from "../../services/discloud/constants";
import { tokenIsDiscloudJwt } from "../../services/discloud/utils";
import { promptTrier } from "../utils";

export async function promptApiToken(): Promise<string> {
  return promptTrier(() => password({
    message: "Your Discloud token:",
    mask: true,
    validate: tokenIsDiscloudJwt,
  }));
}

export async function promptAppConsoleCommand(): Promise<string> {
  return promptTrier(() => input({
    message: ">",
    required: true,
  }));
}

export async function promptUserLocale(): Promise<string> {
  return promptTrier(() => select({
    message: "Choose your locale",
    choices: API_LOCALES,
  }));
}
