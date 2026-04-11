// apps/web/components/campaigns/CampaignCard.tsx
'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, Target, Users } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Campaign } from '@/lib/types'

interface CampaignCardProps {
  campaign: Campaign
  onViewDetails: (campaignId: string) => void
  onContribute: (campaignId: string) => void
}

export function CampaignCard({ campaign, onViewDetails, onContribute }: CampaignCardProps) {
  const progressPercentage = (Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100
  const isFunded = progressPercentage >= 100
  const isActive = campaign.status === 'active'
  const daysLeft = campaign.endDate
    ? Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{campaign.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              by {campaign.creator?.displayName || 'Anonymous'}
            </p>
          </div>
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {campaign.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {campaign.description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Goal
            </span>
            <span className="font-medium">
              {campaign.currentAmount} / {campaign.goalAmount} {campaign.currency}
            </span>
          </div>

          <Progress value={Math.min(progressPercentage, 100)} className="h-2" />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{Math.round(progressPercentage)}% funded</span>
            {daysLeft !== null && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
              </span>
            )}
          </div>

          {campaign.category && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {campaign.category}
              </Badge>
              {campaign.tags?.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onViewDetails(campaign.id)}
          >
            View Details
          </Button>
          {isActive && !isFunded && (
            <Button
              className="flex-1"
              onClick={() => onContribute(campaign.id)}
            >
              Contribute
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}