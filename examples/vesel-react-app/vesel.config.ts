import react from '@vitejs/plugin-react';
import { defineVeselConfig } from 'vesel';

export default defineVeselConfig({
  main: {
    // https://esbuild.github.io/api/#build-api
    esbuild: {
      target: 'node16.9.1',
    },
  },
  renderer: {
    //https://vitejs.dev/config/
    vite: {
      plugins: [react()],
      server: {
        port: 4300,
      },
    },
  },
});
