export type UserRole = 'admin' | 'creator' | 'reviewer' | 'backer'

export interface User {
  id: string
  email: string
  walletAddress?: string
  role: UserRole
  reputation: number
  kycVerified: boolean
  badges: string[]
}
