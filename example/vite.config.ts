import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import assemblyScriptPlugin from 'vite-plugin-assemblyscript-asc'

export default defineConfig({
  plugins: [
    assemblyScriptPlugin(),
    solidPlugin()
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
