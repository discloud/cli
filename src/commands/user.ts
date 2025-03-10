import { type CommandInterface } from "../interfaces/command";

interface CommandArgs { }

export default <CommandInterface<CommandArgs>>{
  name: "user [command]",
  description: "Manage your profile",
};
