import { supabase } from '../lib/supabase';

export class PayoutsService {
  /**
   * Fetch all payouts for a specific farmer.
   */
  static async getFarmerPayouts(farmerId: string) {
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Trigger the generate_payout RPC for a specific order.
   * This is typically called automatically by a webhook or admin script
   * after an order is successfully marked as 'paid' or 'delivered'.
   */
  static async triggerPayoutGeneration(orderId: string) {
    const { error } = await supabase.rpc('generate_payout', {
      p_order_id: orderId
    });

    if (error) throw error;
    return { success: true };
  }
}
