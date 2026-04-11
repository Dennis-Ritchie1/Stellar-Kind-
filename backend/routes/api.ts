import { Router } from 'express'
import { createCampaign, listCampaigns } from '../controllers/campaignController'
import { signIn, signUp } from '../controllers/authController'

const router = Router()

router.post('/auth/signin', signIn)
router.post('/auth/signup', signUp)

router.get('/campaigns', listCampaigns)
router.post('/campaigns', createCampaign)

export default router
