import { GluegunToolbox } from "gluegun";

export default function (toolbox: GluegunToolbox) {
  const { parameters } = toolbox;

  if (parameters.options.d || parameters.options.debug)
    return toolbox.print.debug = console.log;

  return toolbox.print.debug = () => null;
}