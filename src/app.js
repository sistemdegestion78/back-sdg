require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const authRoutes = require('./routes/auth.routes')
const { authMiddleware } = require('./middleware/auth')
const gastosRoutes = require('./routes/gastos.routes')
const viajesRoutes = require('./routes/viajes.routes')
const dashboardRoutes = require('./routes/dashboard.routes')
const placasRoutes = require('./routes/placas.routes')
const empresasRoutes = require('./routes/empresas.routes')

const app = express()

app.use(helmet())

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

const corsOptions = {
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error('CORS no permitido'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.options('/{*splat}', cors(corsOptions))

app.use(express.json({ limit: '1mb' }))

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.get('/', (req, res) => {
  res.json({ ok: true, service: 'back-sdg' })
})

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
app.use('/api/auth/forgot-password', authLimiter)
app.use('/api/auth', authRoutes)

app.use('/api/gastos', authMiddleware, gastosRoutes)
app.use('/api', authMiddleware, viajesRoutes)
app.use('/api/dashboard', authMiddleware, dashboardRoutes)
app.use('/api/placas', authMiddleware, placasRoutes)
app.use('/api/empresas', authMiddleware, empresasRoutes)

module.exports = app
