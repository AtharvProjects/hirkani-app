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
    
    // Attempt to schedule AI tips in the background
    scheduleDailyTips().catch(console.error);

    console.log('Push notifications scheduled successfully');
  } catch (error) {
    logger.error(error, 'setupPushNotifications');
  }
}

export async function scheduleDailyTips() {
  try {
    if (typeof window === 'undefined') return;
    if (!(window as any).Capacitor?.isNativePlatform()) return;
    
    // We fetch 7 tips for the next 7 days
    const { api } = await import('./api');
    const profile = await api.getProfile();
    if (!profile) return;
    
    const { getDailyTips } = await import('./recommendations');
    const result = await getDailyTips(profile, 7);
    if (!result || !result.tips || result.tips.length === 0) return;
    
    // Clear old scheduled tips (IDs 10 to 16)
    const oldIds = Array.from({ length: 7 }, (_, i) => ({ id: i + 10 }));
    await LocalNotifications.cancel({ notifications: oldIds }).catch(() => {});
    
    const scheduledNotifications = result.tips.map((tip: string, index: number) => {
      // Schedule each tip for consecutive days at 10:00 AM
      const date = new Date();
      date.setDate(date.getDate() + index + 1);
      date.setHours(10, 0, 0, 0);
      
      return {
        title: `Week ${profile.pregnancy_week || '?'} Tip 🌸`,
        body: tip,
        id: index + 10,
        schedule: {
          at: date,
          allowWhileIdle: true
        }
      };
    });
    
    await LocalNotifications.schedule({ notifications: scheduledNotifications });
    console.log('Daily AI tips scheduled successfully for next 7 days');
  } catch (error) {
    logger.error(error, 'scheduleDailyTips');
  }
}
