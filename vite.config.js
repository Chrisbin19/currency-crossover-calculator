import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // This is the crucial line that fixes the deployment.
  // It tells Vite that your project will live in a subfolder.
  base: '/currency-crossover-calculator/',
  
  // --- NEW: Tell Vite to build the project into a folder named "docs" ---
  build: {
    outDir: 'docs',
  },
});