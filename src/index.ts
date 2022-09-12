import * as Sentry from "@sentry/node";
import "@sentry/tracing";
import { build } from "gluegun";

Sentry.init({
  dsn: "https://c7832919af874c068ce1ffe90177f470@sentry.discloudbot.com/4",
  tracesSampleRate: 1.0,
});

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