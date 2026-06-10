export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'customer' | 'farmer' | 'admin'
          full_name: string | null
          phone_number: string | null
          preferred_language: 'English' | 'Telugu' | 'Hindi' | 'Tamil' | 'Kannada' | null
          delivery_address: Json | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      villages: {
        Row: {
          id: string
          name: string
          state: string
          district: string
          pincode: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['villages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['villages']['Insert']>
      }
      farmers: {
        Row: {
          id: string
          village_id: string | null
          bio: string | null
          farm_size_acres: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['farmers']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['farmers']['Insert']>
      }
      listings: {
        Row: {
          id: string
          farmer_id: string
          title: string
          description: string | null
          rice_variety: string
          price_per_kg: number
          stock_kg: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['listings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['listings']['Insert']>
      }
      listing_images: {
        Row: {
          id: string
          listing_id: string
          image_url: string
          is_primary: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['listing_images']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['listing_images']['Insert']>
      }
    }
  }
}
