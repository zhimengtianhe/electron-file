import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
// @ts-ignore
import optimizer from 'vite-plugin-optimizer'
import topLevelAwait from 'vite-plugin-top-level-await'
// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  // build: {
  //   rollupOptions: {
  //     external: ['bluebird']
  //   }
  // },
  plugins: [
    topLevelAwait({
      promiseExportName: '__tla',
      promiseImportName: (i: any) => `__tla_${i}`
    }),
    optimizer({
      electron: `const { ipcRenderer } = require('electron'); export { ipcRenderer };`
    }),
    vue(),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false // css in js
        })
      ]
    })
  ],
  server: {
    port: 3004
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
