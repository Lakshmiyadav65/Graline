import { farmerRepository } from '../repositories/farmer.repository'

export class FarmerService {
  async getDashboardData(farmerId: string) {
    const data = await farmerRepository.getDashboardStats(farmerId)
    // Add business logic such as calculating revenue or formatting
    return data
  }

  async getMyListings(farmerId: string) {
    return await farmerRepository.getMyListings(farmerId)
  }
}

export const farmerService = new FarmerService()
