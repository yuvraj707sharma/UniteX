import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jecrc.unitex',
  appName: 'UniteX',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: false
    },
    App: {
      appUrlOpen: {
        iosCustomScheme: 'unitex',
        androidCustomScheme: 'unitex'
      }
    }
  }
};

export default config;