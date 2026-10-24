
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/lomba-dweb/',

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        explore: resolve(__dirname, 'explore.html'),
        preparedness: resolve(__dirname, 'preparedness.html'),
        climateTrends: resolve(__dirname, 'climate-trends.html'),
        methodology: resolve(__dirname, 'methodology.html'),
      },
    },
  },
});
