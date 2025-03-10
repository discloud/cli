import { type CommandInterface } from "../interfaces/command";

interface CommandArgs { }

export default <CommandInterface<CommandArgs>>{
  name: "team [command]",
  description: "Manage team apps",
};
