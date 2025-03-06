import { defineConfig } from 'counter.js';

export default defineConfig({
  server: {
    host: '0.0.0.0', 
    allowedHosts: 'all',
  },
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [],
    },
  },
});