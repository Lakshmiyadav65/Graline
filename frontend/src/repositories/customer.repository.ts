import { createClient } from '@/server/supabase/server'

export class CustomerRepository {
  async getProfile(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      
    if (error) throw error
    return data
  }

  async updateProfile(userId: string, updates: any) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
      
    if (error) throw error
    return data
  }

  async getMyOrders(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, listings(*))')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false })
      
    if (error) throw error
    return data
  }
}

export const customerRepository = new CustomerRepository()
