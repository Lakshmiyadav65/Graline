import { createClient } from '@/server/supabase/server'
import type { FarmerOrderRow, RiceVariety } from '@/lib/api/types'

export class FarmerRepository {
  async getDashboardStats(farmerId: string) {
    const supabase = createClient()
    
    // 1. Get farmer profile with village details
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*, farmers(*, villages(*))')
      .eq('id', farmerId)
      .single()
      
    if (profileErr) throw profileErr

    // 2. Get active listings count
    const { count: listingsCount } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('farmer_id', farmerId)
      .eq('is_active', true)

    // 3. Get total stock available
    const { data: listings } = await supabase
      .from('listings')
      .select('stock_kg')
      .eq('farmer_id', farmerId)
      
    const totalStock = listings?.reduce((sum, l) => sum + Number(l.stock_kg), 0) || 0

    // 4. Get order items with order status and customer details
    const { data: orderItems, error: itemsErr } = await supabase
      .from('order_items')
      .select(`
        id,
        quantity_kg,
        price_per_kg,
        pack_kg,
        qty,
        variety,
        order_id,
        orders (
          order_number,
          status,
          created_at,
          delivery_date,
          customer_id,
          profiles:customer_id (
            full_name
          )
        )
      `)
      .eq('farmer_id', farmerId)

    if (itemsErr) throw itemsErr

    // Calculate revenue (paise) for all non-cancelled orders
    const nonCancelledItems = (orderItems || []).filter((item: any) => item.orders?.status !== 'cancelled');
    const totalRevenue = nonCancelledItems.reduce((sum, item) => {
      const totalItemRupees = Number(item.quantity_kg) * Number(item.price_per_kg);
      const commissionAmount = totalItemRupees * 0.10; // 10%
      const earningsPaise = Math.round((totalItemRupees - commissionAmount) * 100);
      return sum + earningsPaise;
    }, 0);

    // Unique orders count
    const uniqueOrderIds = new Set((orderItems || []).map(item => item.order_id));
    const uniqueOrdersCount = uniqueOrderIds.size;

    // Format incoming orders
    const formattedOrders: FarmerOrderRow[] = (orderItems || []).map((item: any) => {
      const order = item.orders;
      const customerName = order?.profiles?.full_name || "Customer";
      const totalItemRupees = Number(item.quantity_kg) * Number(item.price_per_kg);
      const commissionAmount = totalItemRupees * 0.10;
      const earningsPaise = Math.round((totalItemRupees - commissionAmount) * 100);
      
      return {
        order_number: order?.order_number || "GL-XXXXXX",
        variety: item.variety as RiceVariety,
        pack_kg: Number(item.pack_kg) || 10,
        qty: Number(item.qty) || 1,
        customer_label: customerName,
        pickup_date: order?.delivery_date || new Date().toISOString(),
        earnings_paise: earningsPaise,
        status: order?.status || "pending"
      };
    });

    return {
      profile,
      stats: {
        totalListings: listingsCount || 0,
        availableStock: totalStock,
        totalOrders: uniqueOrdersCount,
        revenue: totalRevenue
      },
      incoming_orders: formattedOrders
    }
  }

  async getMyListings(farmerId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('listings')
      .select('*, listing_images(image_url, is_primary)')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}

export const farmerRepository = new FarmerRepository()
