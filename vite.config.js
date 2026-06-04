import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: false // We will open it manually or use subagent
  }
});
