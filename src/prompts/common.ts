import inquirer from "inquirer";
import { promptTrier } from "./utils";

export async function promptConfirm(message: string): Promise<boolean> {
  return promptTrier(() => inquirer.prompt({
    type: "confirm",
    name: "answer",
    message,
  }));
}