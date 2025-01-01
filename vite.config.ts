import path from 'node:path'
import { reactPresets } from '@bit-ocean/auto-import'
import react from '@vitejs/plugin-react'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), AutoImport({
    imports: reactPresets,
    dts: '@types/auto-imports.d.ts',
    include: [
      /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
      /\.md$/, // .md
    ],
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
