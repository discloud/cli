import { build } from "gluegun";

export function run(argv: string[]) {
  const cli = build("discloud")
    .src(__dirname)
    .defaultCommand()
    .help()
    .version()
    .create();

  return cli.run(argv);
}