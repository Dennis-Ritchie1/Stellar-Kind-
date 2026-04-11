import { Request, Response } from 'express'

export async function listCampaigns(_req: Request, res: Response) {
  // TODO: fetch campaigns from the database and return paginated results
  res.json([{ id: 'campaign-1', title: 'Stellar crowdfunding pilot', status: 'active' }])
}

export async function createCampaign(req: Request, res: Response) {
  const campaign = req.body
  // TODO: validate and persist the campaign to database
  res.status(201).json({ ...campaign, id: 'campaign-1', status: 'draft' })
}
