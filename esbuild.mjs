import { context } from "esbuild";
import { readFileSync } from "fs";
import Replace from "unplugin-replace/esbuild";

export function versionInjector() {
  return Replace({
    include: [/\.(js|ts)$/],
    values: [{
      find: "__PACKAGE_VERSION__",
      replacement() {
        /** @type {import("type-fest").PackageJson} */
        const pkg = JSON.parse(readFileSync("./package.json", "utf8"));
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
      for (let i = 0; i < result.errors.length; i++) {
        const error = result.errors[i];

        console.error("✘ [ERROR] %s", error.text);

        console.error("    %s:%s:%s:", error.location.file, error.location.line, error.location.column);
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
    outExtension: { ".js": ".mjs", ".ts": ".mts" },
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
