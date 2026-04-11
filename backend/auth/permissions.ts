export type UserRole = 'admin' | 'creator' | 'reviewer' | 'backer'

export function requireRole(role: UserRole) {
  return (req, res, next) => {
    const user = req.user as { role?: UserRole }
    if (!user?.role || user.role !== role) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}

export const roles = ['admin', 'creator', 'reviewer', 'backer'] as const
