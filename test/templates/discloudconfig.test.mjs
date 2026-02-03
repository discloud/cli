import ejs from "ejs";
import { suite, test } from "node:test";
import { join } from "path";

suite("template DiscloudConfig test", async () => {
  await test("rendering Discloud Config", async (t) => {
    const templateFilePath = join("templates", "discloud.config.ejs");

    const props = {
      Undefined: undefined,
      Null: null,
      Number: 0,
      EmptyString: "",
      String: "String",
    };

    const expected = "# https://docs.discloud.com/en/discloud.config\nNumber=0\nEmptyString=\nString=String\n";

    const rendered = await ejs.renderFile(templateFilePath, { props }, { async: true });

    t.assert.strictEqual(rendered.replace(/\r/g, ""), expected);
  });
});
