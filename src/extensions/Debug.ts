import { GluegunToolbox } from "@discloudapp/gluegun";

export default function (toolbox: GluegunToolbox) {
  const { parameters, print } = toolbox;

  if (parameters.options.d || parameters.options.debug) {
    print.debug = console.debug;
    print.debug(parameters);
    return;
  }

  return print.debug = () => null;
}