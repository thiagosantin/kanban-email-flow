
/**
 * Database configuration
 * 
 * This file provides configuration for the Supabase client that connects
 * to the PostgreSQL database. The values can be overridden by environment
 * variables when running in Docker.
 */

// Default values - these will be used if not overridden
const defaultConfig = {
  supabaseUrl: "https://bwhkckwtfsvuduucdfyz.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3aGtja3d0ZnN2dWR1dWNkZnl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MjY3NzIsImV4cCI6MjA2MDIwMjc3Mn0.Eas8rs5Z1oOonuOTiDG-sHm_l3kVZpgDUzC1ykB9lLY"
};

/**
 * Get configuration for the database.
 * This function will check for environment variables first and fall back to default values.
 */
export function getDatabaseConfig() {
  // In browser environment, check for window.ENV values first
  // This allows for configuration to be injected at runtime in Docker
  if (typeof window !== 'undefined' && window.ENV) {
    return {
      supabaseUrl: window.ENV.SUPABASE_URL || defaultConfig.supabaseUrl,
      supabaseAnonKey: window.ENV.SUPABASE_ANON_KEY || defaultConfig.supabaseAnonKey
    };
  }
  
  // Fall back to default config values
  return defaultConfig;
}

// Type declaration for window.ENV
declare global {
  interface Window {
    ENV?: {
      SUPABASE_URL?: string;
      SUPABASE_ANON_KEY?: string;
    };
  }
}
