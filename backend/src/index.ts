import express from 'express'
import cors from 'cors'
import apiRouter from '../routes/api'

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api', apiRouter)

app.get('/', (_req, res) => {
  res.send({ status: 'Stellar-Kind backend running' })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
