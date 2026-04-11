import { Request, Response, NextFunction } from 'express'

export function walletAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const walletAddress = req.headers['x-wallet-address'] as string | undefined
  if (!walletAddress) {
    return res.status(401).json({ error: 'Wallet authentication required' })
  }

  req.user = { walletAddress }
  return next()
}

export function bindWallet(req: Request, res: Response) {
  const { walletAddress } = req.user as { walletAddress: string }
  // Placeholder: persist wallet binding to user profile
  res.json({ walletAddress, message: 'Wallet bound successfully' })
}
