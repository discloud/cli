import { GluegunToolbox, print } from "@discloudapp/gluegun";
import { cpu_arch, os_name, os_platform, os_release, version } from "../util/constants";

export default function (toolbox: GluegunToolbox) {
  if (toolbox.parameters.options.d || toolbox.parameters.options.debug) {
    toolbox.print.debug = console.debug;

    if (!["help"].includes(toolbox.parameters.command ?? ""))
      toolbox.print.debug(
        "discloud"
        + (toolbox.parameters.command ?
          toolbox.parameters.command === "discloud" ? "" :
            ` ${toolbox.parameters.command}` : "")
        + ` v${version}`
        + ` ${os_name} ${os_release} ${os_platform} ${cpu_arch}`,
      );

    toolbox.print.debug(toolbox.parameters);
    return;
  }

  if (!["help"].includes(toolbox.parameters.command ?? ""))
    print.info(
      "discloud"
      + (toolbox.parameters.command ?
        toolbox.parameters.command === "discloud" ? "" :
          ` ${toolbox.parameters.command}` : "")
      + ` v${version}`,
    );

  return toolbox.print.debug = () => null;
}