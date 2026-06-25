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
      customers: {
        Row: {
          id: string
          created_at: string
        }
        Insert: {
          id: string
          created_at?: string
        }
        Update: {
          id?: string
          created_at?: string
        }
      }
      villages: {
        Row: {
          id: string
          name: string
          state: string
          district: string
          pincode: string | null
          slug: string | null
          story: string | null
          photo_url: string | null
          hub_address: string | null
          status: string | null
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
          photo_url: string | null
          farming_since_year: number | null
          upi_id: string | null
          story: string | null
          status: string | null
          aadhaar_last4: string | null
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
          type: string | null
          is_organic: boolean | null
          organic_certification: string | null
          harvest_year: number | null
          harvest_season: string | null
          is_milled: boolean | null
          milled_on: string | null
          pack_sizes: Json | null
          retail_paise: number | null
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
      orders: {
        Row: {
          id: string
          customer_id: string
          total_amount: number
          status: string
          order_number: string | null
          fulfillment_type: string | null
          delivery_address: Json | null
          delivery_date: string | null
          subtotal: number | null
          delivery_fee: number | null
          cod_fee: number | null
          commission_amount: number | null
          payment_method: string | null
          payment_status: string | null
          status_history: Json | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          listing_id: string
          quantity_kg: number
          price_per_kg: number
          farmer_id: string | null
          variety: string | null
          pack_kg: number | null
          qty: number | null
          subtotal_paise: number | null
          farmer_name: string | null
          village_name: string | null
          photo_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
      payouts: {
        Row: {
          id: string
          farmer_id: string
          amount: number
          status: string
          processed_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['payouts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payouts']['Insert']>
      }
      samples: {
        Row: {
          id: string
          listing_id: string
          address: Json
          amount: number
          razorpay_order_id: string | null
          razorpay_key: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['samples']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['samples']['Insert']>
      }
      mandi_prices: {
        Row: {
          id: string
          commodity: string
          market: string
          state: string
          modal_price: number
          date: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['mandi_prices']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['mandi_prices']['Insert']>
      }
      route_plans: {
        Row: {
          id: string
          week_of: string
          vehicle: string | null
          driver_name: string | null
          driver_phone: string | null
          status: string | null
          pickups: Json | null
          deliveries: Json | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['route_plans']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['route_plans']['Insert']>
      }
    }
  }
}
