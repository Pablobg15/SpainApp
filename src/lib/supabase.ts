import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase.');
}

const isWebServer = Platform.OS === 'web' && typeof window === 'undefined';

const supabaseStorage = {
  getItem: async (key: string) => {
    if (isWebServer) {
      return null;
    }

    return AsyncStorage.getItem(key);
  },

  setItem: async (key: string, value: string) => {
    if (isWebServer) {
      return;
    }

    await AsyncStorage.setItem(key, value);
  },

  removeItem: async (key: string) => {
    if (isWebServer) {
      return;
    }

    await AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: supabaseStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

if (!isWebServer) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}