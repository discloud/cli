import { context } from "esbuild";
import { esbuildPluginVersionInjector } from "esbuild-plugin-version-injector";

async function main() {
  const production = process.argv.includes("--production");
  const watch = process.argv.includes("--watch");

  const ctx = await context({
    entryPoints: ["src/index.ts", "src/commands/**"],
    bundle: true,
    format: "cjs",
    minify: production,
    sourcemap: "inline",
    sourcesContent: false,
    platform: "node",
    outdir: "build",
    keepNames: true,
    logLevel: "warning",
    packages: "external",
    plugins: [
      esbuildPluginVersionInjector(),
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
