import type { Plugin } from "vite";
import { spawnSync } from "child_process"
import { lstatSync, existsSync, mkdirSync, copyFileSync } from "fs"
import { dirname, sep } from "path"

interface AssemblyScriptPluginOptions {
  srcMatch: string
  srcEntryFile: string
  projectRoot: string
  configFile: string
  distFolder: string
  targetWasmFile: string
}

const defaultOptions: AssemblyScriptPluginOptions = {
  srcMatch: 'assembly',
  srcEntryFile: 'assembly/index.ts',
  projectRoot: 'src/engine',
  configFile: 'asconfig.json',
  targetWasmFile: 'build/assembly.wasm',
  distFolder: 'dist'
}

const copySourceMap = (options: AssemblyScriptPluginOptions) => {
  const sourceMapFile = `${options.projectRoot}${sep}${options.targetWasmFile}.map`
  const distSourceMapFile = `${options.distFolder}${sep}${options.projectRoot}${sep}${options.targetWasmFile}.map`
  const distSourceMapFolder = dirname(distSourceMapFile)
  mkdirSync(distSourceMapFolder, { recursive: true })
  copyFileSync(sourceMapFile, distSourceMapFile)
}

const spawnAscCmd = (baseScriptCmd: string, mode: 'debug'|'release') => {
  console.log('[AssemblyScript] Compiling...')
  console.time('Done')
  
  spawnSync(`${baseScriptCmd} ${mode}`, { 
    shell: true,
    cwd: process.cwd(), 
    env: process.env,
    stdio: 'inherit'
  })
  console.timeEnd('Done')
}

export default function assemblyScriptPlugin(userOptions: AssemblyScriptPluginOptions = defaultOptions): Plugin {
  
  const options = {
    ...defaultOptions,
    ...userOptions
  }

  const ascBinPathRoot = `${options.projectRoot}${sep}node_modules${sep}.bin${sep}asc`

  if (!existsSync(options.projectRoot)) {
    throw new Error(`[vite-plugin-assemblyscript] projectRoot: ${options.projectRoot} does not exist`)
  }

  if (!lstatSync(options.projectRoot).isDirectory()) {
    throw new Error(`[vite-plugin-assemblyscript] projectRoot: ${options.projectRoot} is not a folder`)
  }

  const entryFilePath = `${options.projectRoot}${sep}${options.srcEntryFile}`

  if (!existsSync(entryFilePath)) {
    throw new Error(`[vite-plugin-assemblyscript] srcEntryFile: ${options.srcEntryFile} does not exist`)
  }

  const baseScriptCmd = `${ascBinPathRoot} ${entryFilePath} --config ${options.projectRoot}${sep}${options.configFile} --target`
  
  return {
    name: 'vite-plugin-assemblyscript',
    handleHotUpdate({ file }) {
      if (file.indexOf(`${options.projectRoot}${sep}${ options.srcMatch}`) > -1) {
        spawnAscCmd(baseScriptCmd, 'debug')
        copySourceMap(options)
      }
    },
    buildStart() {
      spawnAscCmd(baseScriptCmd, 'release')
      copySourceMap(options)
    }
  }
}
