import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: [
      '@ionic-native/core',
      '@ionic-native/screenshot',
      '@ionic-native/app-launcher',
      '@ionic-native/apple-pay',
      '@ionic-native/text-to-speech',
    ],
  },
  ssr: {
    noExternal: ['@ionic-native'],
  },
});

