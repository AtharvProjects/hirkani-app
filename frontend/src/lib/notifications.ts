import { LocalNotifications } from '@capacitor/local-notifications';
import { logger } from './logger';

export async function setupPushNotifications() {
  try {
    if (typeof window === 'undefined') return;
    
    // Check if capacitor is available
    if (!(window as any).Capacitor?.isNativePlatform()) return;

    // Request permission to use local notifications
    const permStatus = await LocalNotifications.requestPermissions();
    if (permStatus.display !== 'granted') {
      console.warn('User denied local notifications permission');
      return;
    }

    // Clear any existing pending notifications
    await LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }] }).catch(() => {});

    // Schedule new recurring notifications
    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Good morning! ☀️',
          body: "Don't forget your prenatal vitamins today 💊",
          id: 1,
          schedule: {
            on: { hour: 9, minute: 0 },
            allowWhileIdle: true,
          }
        },
        {
          title: 'Stay hydrated! 💧',
          body: 'Time for a glass of water to support your baby!',
          id: 2,
          schedule: {
            on: { hour: 14, minute: 0 }, // 2:00 PM
            allowWhileIdle: true,
          }
        }
      ]
    });
    
    console.log('Push notifications scheduled successfully');
  } catch (error) {
    logger.error(error, 'setupPushNotifications');
  }
}
