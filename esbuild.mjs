import { context } from "esbuild";
import { readFileSync } from "fs";
import Replace from "unplugin-replace/esbuild";

function versionInjector() {
  /** @type {import("type-fest").PackageJson} */
  let pkg;
  return Replace({
    include: [/\.(js|ts)$/],
    values: [{
      find: "__PACKAGE_VERSION__",
      replacement() {
        pkg ??= JSON.parse(readFileSync("./package.json", "utf8"));
        return pkg.version;
      },
    }],
  });
}

/** @type {import("esbuild").Plugin} */
const esbuildProblemMatcherPlugin = {
  name: "esbuild-problem-matcher",

  setup(build) {
    build.onStart(() => console.log("[watch] build started"));

    build.onEnd((result) => {
      if (result.warnings.length) {
        const messages = [], params = [];

        for (const m of result.warnings) {
          messages.push("⚠ [WARN] %s\n    %s:%s:%s:");
          params.push(m.text, m.location.file, m.location.line, m.location.column);
        }

        console.warn(messages.join("\n\n"), ...params);
      }

      if (result.errors.length) {
        const messages = [], params = [];

        for (const m of result.errors) {
          messages.push("✘ [ERROR] %s\n    %s:%s:%s:");
          params.push(m.text, m.location.file, m.location.line, m.location.column);
        }

        console.error(messages.join("\n\n"), ...params);
      }

      console.log("[watch] build finished");
    });
  },
};

async function main() {
  const production = process.argv.includes("--production");
  const watch = process.argv.includes("--watch");

  const ctx = await context({
    entryPoints: ["src/index.ts", "src/commands/**"],
    bundle: true,
    format: "esm",
    minify: production,
    sourcemap: "inline",
    sourcesContent: false,
    platform: "node",
    outdir: "build",
    outExtension: { ".js": ".mjs" },
    logLevel: "warning",
    packages: "external",
    plugins: [
      ...watch ? [esbuildProblemMatcherPlugin] : [],
      versionInjector(),
    ],
  });

  if (watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
