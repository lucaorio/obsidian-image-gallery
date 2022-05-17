import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";

const banner = `/* Obsidian Image Gallery Community plugin: https://github.com/lucaorio/obsidian-image-gallery */`;

const prod = process.argv[2] === "production";

esbuild
  .build({
    banner: { js: banner },
    entryPoints: ["src/main.ts"],
    bundle: true,
    external: ["obsidian", "electron", ...builtins],
    format: "cjs",
    watch: !prod,
    target: "es2016",
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    treeShaking: true,
    outfile: "main.js",
  })
  .catch(() => process.exit(1));
