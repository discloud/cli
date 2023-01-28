import { build } from "@discloudapp/gluegun";
import { exit } from "node:process";

export async function run(argv: string[]) {
  const cli = build("discloud")
    .src(__dirname)
    .plugins("./node_modules", { matching: "discloud-*", hidden: true })
    .defaultCommand()
    .help()
    .version()
    .create();

  await cli.run(argv);

  exit(0);
}