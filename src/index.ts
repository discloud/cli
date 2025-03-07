import { dirname } from "path";
import Core from "./core";

export default async function (argv: string[]) {
  const core = new Core(argv);

  await core.run();
}

export const buildRootPath = __dirname;
export const rootPath = dirname(buildRootPath);
