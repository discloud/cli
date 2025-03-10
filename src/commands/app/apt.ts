import { type CommandInterface } from "../../interfaces/command";

interface CommandArgs { }

export default <CommandInterface<CommandArgs>>{
  name: "apt [command]",
  description: "Manager your apps APT",
};
