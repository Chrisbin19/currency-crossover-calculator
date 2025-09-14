import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // This is for the deployment on GitHub Pages. It's correct.
  base: '/currency-crossover-calculator/',

  // This is the new, crucial part that fixes the build error.
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
});

