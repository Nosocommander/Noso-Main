import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.noso.woo',
  appName: 'Noso Woo',
  webDir: 'dist',         // ⚡ must be "dist" for Vite
  bundledWebRuntime: false,
};

export default config;
