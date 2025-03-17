import { type ICommand } from "../interfaces/command";

interface CommandArgs { }

export default <ICommand<CommandArgs>>{
  name: "user [command]",
  description: "Manage your profile",
};
