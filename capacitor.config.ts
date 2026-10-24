import type { CapacitorConfig } from '@capacitor/cli';

/**
 * SmartEV Mobile Configuration for Android Studio & iOS
 *
 * Testing options:
 * - Physical Phone on Wi-Fi: uses 'http://192.168.1.12:3000' (your PC's local IP)
 * - Android Studio Emulator: use 'http://10.0.2.2:3000'
 * - Production: set your deployed Vercel domain
 */
const DEV_SERVER_URL = process.env.CAPACITOR_SERVER_URL || 'http://192.168.1.12:3000';

const config: CapacitorConfig = {
  appId: 'com.smartev.app',
  appName: 'SmartEV',
  webDir: 'out',
  server: {
    url: DEV_SERVER_URL,
    cleartext: true,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      backgroundColor: '#070c14',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
