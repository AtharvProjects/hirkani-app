import { supabase } from './supabase';

export const logger = {
  error: async (error: Error | any, context?: string) => {
    console.error(`[Hirkani Error] ${context ? `[${context}] ` : ''}`, error);

    try {
      // Try to get user if authed
      const { data: { session } } = await supabase.auth.getSession();
      
      const payload = {
        error_message: error?.message || String(error),
        error_stack: error?.stack || null,
        user_id: session?.user?.id || null,
        device_info: typeof window !== 'undefined' ? navigator.userAgent : 'Server',
      };

      // Send to our new crash_reports table
      await supabase.from('crash_reports').insert(payload);
    } catch (e) {
      // Fail silently if logger fails
      console.error("Logger failed to save crash report:", e);
    }
  }
};
