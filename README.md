# vite-plugin-assemblyscript-asc

[![Test Status](https://img.shields.io/github/workflow/status/krymel/vite-plugin-assemblyscript/Test?style=flat-square)](https://github.com/krymel/vite-plugin-assemblyscript/actions?query=workflow%3ATest)
[![npm](https://img.shields.io/npm/v/vite-plugin-assemblyscript-asc?style=flat-square)](https://www.npmjs.com/package/vite-plugin-assemblyscript-asc)
[![License](https://img.shields.io/github/license/krymel/vite-plugin-assemblyscript?style=flat-square)](LICENSE)

Add a AssemblyScript codebase to a Vite project with full HMR support and debug with source maps.
Integrate the resulting WebAssembly in your frontend using standard AssemblyScript ESM imports
and the typical `debug` and `release` build variants mapped to `vite dev` and `vite build`.

## Installation

Just install it as:

```bash
yarn add -D vite-plugin-assemblyscript-asc
```

## Vite integration usage

`vite.config.ts`
```typescript
import assemblyScriptPlugin from "vite-plugin-assemblyscript-asc"

export default defineConfig({
  plugins: [
    assemblyScriptPlugin()
  ]
})
```

## Runtime WebAssembly integration usage

The WebAssembly module comes with ESM bindings generated automatically.
Also, the WASM code is inlined and being instanciated synchronously:

`src/index.ts`
```typescript 
import { add } from './as/build/assembly'

console.log(add(3, 4)) // prints: '7'
```

## Example project

If you'd like to copy & paste, the [`example`](https://github.com/krymel/vite-plugin-assemblyscript-asc/tree/main/example) folder contains a fully working example project layout.

## Default project layout

The default plugin configuration assumes that the AssemblyScript codebase is located in `src/as` and that the generated WebAssembly module is stored as `build/assembly.wasm`:

```bash
dist/
  [Vite build files]
src/
  as/
    assembly/
      [AssemblyScript codebase]
    build/
      assembly.wasm
      assembly.wasm.map
    asconfig.json
    package.json
  [Your other code, non-AssemblyScript]
```

In `asconfig.json` it is assumed that you change `outFile` to `build/assembly.wasm` and
`textFile` to `build/assembly.wat` so that you can import from a single file location
and the Vite execution mode could determine the build variant:

`src/as/asconfig.json`
```json
{
  "targets": {
    "debug": {
      "outFile": "build/assembly.wasm",
      "textFile": "build/assembly.wat",
      "sourceMap": true,
      "debug": true
    },
    "release": {
      "outFile": "build/assembly.wasm",
      "textFile": "build/assembly.wat",
      "sourceMap": true,
      "optimizeLevel": 3,
      "shrinkLevel": 0,
      "converge": false,
      "noAssert": false
    }
  },
  "options": {
    "bindings": "esm"
  }
}
```

## Custom project layout

That's why the default config looks like this:

```ts
{
  projectRoot: 'src/as',
  configFile: 'asconfig.json',
  srcMatch: 'assembly',
  srcEntryFile: 'assembly/index.ts',
  targetWasmFile: 'build/assembly.wasm',
  distFolder: 'dist'
}
```

In case your project layout looks differently, make sure the paths are set-up accordingly, 
by providing the necessary configuration options:

`vite.config.ts`
```typescript
import assemblyScriptPlugin from "vite-plugin-assemblyscript-asc"

export default defineConfig({
  plugins: [
    // let's assume the codebase is located somewhere else
    assemblyScriptPlugin({ projectRoot: 'packages/assemblyscript' })
  ]
})
```

## Contributors

Thanks to Menci, the author of [vite-plugin-wasm](https://github.com/Menci/vite-plugin-wasm) 
for providing a great project layout and e2e test code.