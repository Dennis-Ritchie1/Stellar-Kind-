// apps/web/hooks/campaigns/useCampaigns.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createSupabaseBrowserClient } from '@/lib/supabase-client'
import type { Campaign, CreateCampaignData } from '@/lib/types'

const supabase = createSupabaseBrowserClient()

export function useCampaigns(filters?: {
  status?: string
  category?: string
  creatorId?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: ['campaigns', filters],
    queryFn: async () => {
      let query = supabase
        .from('campaigns')
        .select(`
          *,
          creator:profiles(display_name, bio, image_url),
          milestones:campaign_milestones(*)
        `)
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.category) {
        query = query.eq('category', filters.category)
      }

      if (filters?.creatorId) {
        query = query.eq('creator_id', filters.creatorId)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to fetch campaigns: ${error.message}`)
      }

      return data as Campaign[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCampaign(campaignId: string) {
  return useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          creator:profiles(display_name, bio, image_url),
          milestones:campaign_milestones(*),
          contributions:campaign_contributions(*, contributor:profiles(display_name))
        `)
        .eq('id', campaignId)
        .single()

      if (error) {
        throw new Error(`Failed to fetch campaign: ${error.message}`)
      }

      return data as Campaign
    },
    enabled: !!campaignId,
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (campaignData: CreateCampaignData) => {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([campaignData])
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create campaign: ${error.message}`)
      }

      return data as Campaign
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Campaign> }) => {
      const { data, error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update campaign: ${error.message}`)
      }

      return data as Campaign
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaign', data.id] })
    },
  })
}

export function useContributeToCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      campaignId,
      amount,
      contributorId,
      transactionHash,
    }: {
      campaignId: string
      amount: string
      contributorId: string
      transactionHash: string
    }) => {
      const { data, error } = await supabase
        .from('campaign_contributions')
        .insert([{
          campaign_id: campaignId,
          contributor_id: contributorId,
          amount,
          transaction_hash: transactionHash,
          status: 'confirmed',
        }])
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to record contribution: ${error.message}`)
      }

      // Update campaign current amount
      const { error: updateError } = await supabase.rpc('increment_campaign_amount', {
        campaign_id: campaignId,
        increment_amount: amount,
      })

      if (updateError) {
        throw new Error(`Failed to update campaign amount: ${updateError.message}`)
      }

      return data
    },
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] })
    },
  })
}