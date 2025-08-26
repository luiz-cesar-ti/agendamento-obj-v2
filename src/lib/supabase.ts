import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Make sure to create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      equipment: {
        Row: {
          id: string;
          name: string;
          total_quantity: number;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          total_quantity: number;
          category: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          total_quantity?: number;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          full_name: string;
          classroom: string;
          booking_date: string;
          start_time: string;
          end_time: string;
          status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          classroom: string;
          booking_date: string;
          start_time: string;
          end_time: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'expired';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          classroom?: string;
          booking_date?: string;
          start_time?: string;
          end_time?: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'expired';
          created_at?: string;
          updated_at?: string;
        };
      };
      booking_equipment: {
        Row: {
          id: string;
          booking_id: string;
          equipment_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          equipment_id: string;
          quantity: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          equipment_id?: string;
          quantity?: number;
          created_at?: string;
        };
      };
    };
  };
};
