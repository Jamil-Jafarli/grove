import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'az.grove.app',
  appName: 'Grove',
  webDir: 'dist',
  server: {
    // APK içindəki WebView bu URL-ə proxy edər
    androidScheme: 'https',
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
