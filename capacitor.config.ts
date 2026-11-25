import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.lernwerk.dtz',
  appName: 'LernWerk Deutsch',
  webDir: 'app',
  server: {
    androidScheme: 'https'
  }
};

export default config;
