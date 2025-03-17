import { confirm } from "@inquirer/prompts";
import { promptTrier } from "./utils";

export async function promptConfirm(message: string): Promise<boolean> {
  return promptTrier(() => confirm({
    message,
  }));
}
