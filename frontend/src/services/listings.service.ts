import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

type ListingInsert = Database['public']['Tables']['listings']['Insert'];
type ListingUpdate = Database['public']['Tables']['listings']['Update'];

export class ListingsService {
  /**
   * Fetch active listings for the customer browse page.
   * Joins farmer profiles, villages, and images to display rich cards.
   */
  static async getActiveListings() {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        farmers:farmer_id (
          profiles:profiles!farmers_id_fkey (full_name),
          villages:village_id (name, district)
        ),
        listing_images (image_url, is_primary)
      `)
      .eq('is_active', true)
      .gt('stock_kg', 0) // Only show listings with available stock
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Fetch a single listing by ID with its details.
   */
  static async getListingById(listingId: string) {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        farmers:farmer_id (
          bio,
          profiles:profiles!farmers_id_fkey (full_name),
          villages:village_id (name, district, state)
        ),
        listing_images (id, image_url, is_primary)
      `)
      .eq('id', listingId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create a new listing (for farmers).
   */
  static async createListing(listingData: ListingInsert, imageUrls: string[]) {
    // Note: We'd normally wrap this in an RPC or run sequentially since Supabase JS client doesn't 
    // natively support client-side multi-table transactions easily without an Edge Function or Postgres function.
    // Following MVP principles, we insert the listing then its images.

    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert(listingData)
      .select()
      .single();

    if (listingError) throw listingError;

    if (imageUrls.length > 0) {
      const imagesData = imageUrls.map((url, index) => ({
        listing_id: listing.id,
        image_url: url,
        is_primary: index === 0, // First image is primary
      }));

      const { error: imagesError } = await supabase
        .from('listing_images')
        .insert(imagesData);

      if (imagesError) console.error("Failed to insert listing images", imagesError);
    }

    return listing;
  }

  /**
   * Update an existing listing's stock or price.
   */
  static async updateListing(listingId: string, updates: ListingUpdate) {
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', listingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
