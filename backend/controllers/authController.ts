import { Request, Response } from 'express'

export async function signUp(req: Request, res: Response) {
  const { email, password, walletAddress } = req.body
  // TODO: validate input, hash password, create user, and return auth tokens
  res.status(201).json({ email, walletAddress, message: 'User created' })
}

export async function signIn(req: Request, res: Response) {
  const { email, password } = req.body
  // TODO: verify credentials and return session or JWT
  res.json({ token: 'fake-jwt-token', email })
}
