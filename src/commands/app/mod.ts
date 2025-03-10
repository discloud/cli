import { type CommandInterface } from "../../interfaces/command";

interface CommandArgs { }

export default <CommandInterface<CommandArgs>>{
  name: "mod [command]",
  description: "Manager your app team",
};
