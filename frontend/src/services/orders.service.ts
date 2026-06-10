import { supabase } from '../lib/supabase';

export interface OrderItemInput {
  listing_id: string;
  quantity_kg: number;
}

export class OrdersService {
  /**
   * Fetch orders for a specific customer.
   */
  static async getCustomerOrders(customerId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity_kg,
          price_per_kg,
          listings:listing_id (title, rice_variety)
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Create a new order by invoking the secure atomic RPC function.
   * This handles stock validation and transaction management inside Postgres.
   */
  static async createOrder(customerId: string, shippingAddress: string, items: OrderItemInput[]) {
    const { data: orderId, error } = await supabase.rpc('create_order', {
      p_customer_id: customerId,
      p_shipping_address: shippingAddress,
      p_items: items, // Supabase automatically serializes this array to JSONB
    });

    if (error) throw error;
    return orderId;
  }
}
