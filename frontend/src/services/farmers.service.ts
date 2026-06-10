import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

type FarmerRow = Database['public']['Tables']['farmers']['Row'];
type FarmerInsert = Database['public']['Tables']['farmers']['Insert'];
type FarmerUpdate = Database['public']['Tables']['farmers']['Update'];

export class FarmersService {
  /**
   * Get a farmer's profile along with their village and main profile data.
   */
  static async getFarmerProfile(farmerId: string) {
    const { data, error } = await supabase
      .from('farmers')
      .select(`
        *,
        profiles:id (full_name, phone_number, preferred_language),
        villages:village_id (name, state, district)
      `)
      .eq('id', farmerId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update farmer-specific details.
   */
  static async updateFarmer(farmerId: string, updates: FarmerUpdate) {
    const { data, error } = await supabase
      .from('farmers')
      .update(updates)
      .eq('id', farmerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export class VillagesService {
  /**
   * List all villages for dropdowns or filters.
   */
  static async getVillages() {
    const { data, error } = await supabase
      .from('villages')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  }
}
