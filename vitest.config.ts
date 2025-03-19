//import { defineConfig } from './src/counter.js';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  //server: {host: '0.0.0.0', allowedHosts: 'all',},
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      testerHtmlPath: "./index.html",
      instances: [
        {
          name:'chromium',
          browser:'chromium'
        },
      ],
    },
  },
});