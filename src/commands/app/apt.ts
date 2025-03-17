import { type ICommand } from "../../interfaces/command";

interface CommandArgs { }

export default <ICommand<CommandArgs>>{
  name: "apt [command]",
  description: "Manager your apps APT",
};
