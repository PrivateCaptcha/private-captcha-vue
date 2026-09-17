import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@private-captcha/private-captcha-vue': fileURLToPath(
        new URL('../private-captcha-vue/src/index.ts', import.meta.url),
      ),
    },
  },
});
