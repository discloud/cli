import { type ICommand } from "../interfaces/command";

interface CommandArgs { }

export default <ICommand<CommandArgs>>{
  name: "domain",
  description: "Manage your domains",
};
