import type { Plugin } from "vite";
import { spawnSync } from "child_process";
import { lstatSync, existsSync } from "fs";
import { resolve, sep } from "path";

interface AssemblyScriptPluginOptions {
  srcMatch: string;
  srcEntryFile: string;
  projectRoot: string;
  configFile: string;
  distFolder: string;
  targetWasmFile: string;
}

const defaultOptions: AssemblyScriptPluginOptions = {
  srcMatch: "assembly",
  srcEntryFile: "assembly/index.ts",
  projectRoot: "src/as",
  configFile: "asconfig.json",
  targetWasmFile: "build/assembly.wasm",
  distFolder: "dist",
};

const spawnAscCmd = (baseScriptCmd: string, mode: "debug" | "release") => {
  console.log("[AssemblyScript] Compiling...");
  console.time("Done");

  spawnSync(`${baseScriptCmd} ${mode}`, {
    shell: true,
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });
  console.timeEnd("Done");
};

export default function assemblyScriptPlugin(
  userOptions: Partial<AssemblyScriptPluginOptions> = defaultOptions
): Plugin {
  const options = {
    ...defaultOptions,
    ...userOptions,
  };

  const ascBinPathRoot = `${options.projectRoot}${sep}node_modules${sep}.bin${sep}asc`;

  if (!existsSync(options.projectRoot)) {
    throw new Error(
      `[vite-plugin-assemblyscript] projectRoot: ${options.projectRoot} does not exist`
    );
  }

  if (!lstatSync(options.projectRoot).isDirectory()) {
    throw new Error(
      `[vite-plugin-assemblyscript] projectRoot: ${options.projectRoot} is not a folder`
    );
  }

  const entryFilePath = `${options.projectRoot}${sep}${options.srcEntryFile}`;

  if (!existsSync(entryFilePath)) {
    throw new Error(
      `[vite-plugin-assemblyscript] srcEntryFile: ${options.srcEntryFile} does not exist`
    );
  }

  const baseScriptCmd = `${ascBinPathRoot} ${entryFilePath} --config ${options.projectRoot}${sep}${options.configFile} --target`;

  return {
    name: "vite-plugin-assemblyscript-asc",
    handleHotUpdate({ file }) {
      if (
        file.startsWith(resolve(options.projectRoot, options.srcMatch))
      ) {
        spawnAscCmd(baseScriptCmd, "debug");
      }
    },
    buildStart() {
      spawnAscCmd(baseScriptCmd, "release");
    },
  };
}
