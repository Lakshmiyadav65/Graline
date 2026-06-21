import { customerRepository } from '../repositories/customer.repository'

export class CustomerService {
  async getProfile(userId: string) {
    return await customerRepository.getProfile(userId)
  }

  async updateProfile(userId: string, updates: any) {
    return await customerRepository.updateProfile(userId, updates)
  }

  async getMyOrders(userId: string) {
    return await customerRepository.getMyOrders(userId)
  }
}

export const customerService = new CustomerService()
