import { type ICommand } from "../../interfaces/command";

interface CommandArgs { }

export default <ICommand<CommandArgs>>{
  name: "mod [command]",
  description: "Manager your app team",
};
