export interface Campaign {
  id: string
  title: string
  description: string
  creatorId: string
  goalAmount: number
  currentAmount: number
  currency: string
  status: 'draft' | 'active' | 'funded' | 'cancelled'
  milestones: CampaignMilestone[]
  createdAt: string
  updatedAt: string
}

export interface CampaignMilestone {
  id: string
  title: string
  amount: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  dueDate?: string
}
