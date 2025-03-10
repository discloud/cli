import { type CommandInterface } from "../interfaces/command";

interface CommandArgs { }

export default <CommandInterface<CommandArgs>>{
  name: "app [command]",
  description: "Manage your apps",
};
