import { GluegunToolbox } from "@discloudapp/gluegun";

export default function (toolbox: GluegunToolbox) {
  if (toolbox.parameters.options.d || toolbox.parameters.options.debug) {
    toolbox.print.debug = console.debug;
    toolbox.print.debug(toolbox.parameters);
    return;
  }

  return toolbox.print.debug = () => null;
}