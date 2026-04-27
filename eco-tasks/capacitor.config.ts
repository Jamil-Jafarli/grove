import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'az.grove.app',
  appName: 'Grove',
  webDir: 'dist',
  server: {
      url: 'http://74.162.68.66:5173', // sənin dev server IP + port
      cleartext: true
  },
  android: {
    buildOptions: {
      releaseType: 'APK',
    },
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#063232',
    },
  },
};

export default config;
