import { type ICommand } from "../interfaces/command";

interface CommandArgs { }

export default <ICommand<CommandArgs>>{
  name: "subdomain",
  description: "Manage your subdomains",
};
