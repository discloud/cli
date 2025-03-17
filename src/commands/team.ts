import { type ICommand } from "../interfaces/command";

interface CommandArgs { }

export default <ICommand<CommandArgs>>{
  name: "team [command]",
  description: "Manage team apps",
};
