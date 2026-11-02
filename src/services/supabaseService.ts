/**
 * CloudWatch Sentinel - Supabase Integration Service
 * Manages PostgreSQL persistence and Supabase Realtime channel subscription
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConfigured: boolean;
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(config?: SupabaseConfig): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = config?.supabaseUrl || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : '') || '';
  const key = config?.supabaseAnonKey || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY : '') || '';

  if (url && key && url.startsWith('http')) {
    try {
      supabaseInstance = createClient(url, key);
      return supabaseInstance;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }

  return null;
}

export function resetSupabaseClient(url: string, key: string) {
  if (url && key) {
    try {
      supabaseInstance = createClient(url, key);
      return true;
    } catch {
      return false;
    }
  }
  supabaseInstance = null;
  return false;
}

export interface RealtimeEventHandler {
  (event: {
    eventType: 'PIPELINE_STATE_CHANGE' | 'METRIC_THRESHOLD_BREACH' | 'COST_ANOMALY' | 'BUILD_FAILED';
    payload: Record<string, any>;
    timestamp: string;
  }): void;
}

class SentinelRealtimeBus {
  private listeners: RealtimeEventHandler[] = [];
  private isConnected: boolean = true;

  public subscribe(handler: RealtimeEventHandler): () => void {
    this.listeners.push(handler);
    return () => {
      this.listeners = this.listeners.filter((h) => h !== handler);
    };
  }

  public emit(event: {
    eventType: 'PIPELINE_STATE_CHANGE' | 'METRIC_THRESHOLD_BREACH' | 'COST_ANOMALY' | 'BUILD_FAILED';
    payload: Record<string, any>;
    timestamp: string;
  }) {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in realtime listener:', err);
      }
    }
  }

  public getStatus(): { isConnected: boolean; listenerCount: number } {
    return {
      isConnected: this.isConnected,
      listenerCount: this.listeners.length,
    };
  }
}

export const realtimeBus = new SentinelRealtimeBus();
