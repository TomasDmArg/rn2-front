import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'your.app.id',
  appName: 'Your App Name',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      permissionType: 'camera'
    },
    Geolocation: {
      permissions: {
        android: {
          location: 'fine'
        }
      }
    }
  }
};

export default config;
