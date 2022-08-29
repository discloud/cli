import { build } from "gluegun";

export function run(argv: string[]) {
  const cli = build("discloud")
    .src(__dirname)
    .plugins("./node_modules", { matching: "discloud-*", hidden: true })
    .defaultCommand()
    .help()
    .version()
    .create();

  return cli.run(argv);
}