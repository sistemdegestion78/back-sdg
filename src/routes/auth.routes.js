const { Router } = require('express')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const User = require('../models/User.model')
const { generarToken, authMiddleware } = require('../middleware/auth')

const router = Router()

function sanitizeEmail(input) {
  if (typeof input !== 'string') return null
  return input.trim().toLowerCase()
}

function sanitizeString(input) {
  if (typeof input !== 'string') return null
  return input.trim()
}

router.post('/register', async (req, res) => {
  try {
    const nombre = sanitizeString(req.body.nombre)
    const email = sanitizeEmail(req.body.email)
    const password = sanitizeString(req.body.password)
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' })
    }
    if (nombre.length > 100) {
      return res.status(400).json({ error: 'El nombre es demasiado largo' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email inválido' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
    }
    if (password.length > 128) {
      return res.status(400).json({ error: 'La contraseña es demasiado larga' })
    }
    const existe = await User.findOne({ email })
    if (existe) {
      return res.status(400).json({ error: 'Ya existe una cuenta con ese email' })
    }
    const user = await User.create({ nombre, email, password })
    const token = generarToken(user._id)
    res.status(201).json({ user, token })
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar usuario' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const email = sanitizeEmail(req.body.email)
    const password = sanitizeString(req.body.password)
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' })
    }
    const user = await User.findOne({ email })
    if (!user || !(await user.compararPassword(password))) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }
    const token = generarToken(user._id)
    res.json({ user, token })
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
})

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuario' })
  }
})

router.post('/forgot-password', async (req, res) => {
  try {
    const email = sanitizeEmail(req.body.email)
    if (!email) return res.status(400).json({ error: 'El email es obligatorio' })

    const user = await User.findOne({ email })
    if (!user) {
      return res.json({ message: 'Si el email existe, recibirás un enlace de recuperación' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    user.resetTokenExpiry = Date.now() + 60 * 60 * 1000
    await user.save({ validateModifiedOnly: true })

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`

    const smtpHost = process.env.SMTP_HOST
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: smtpUser, pass: smtpPass },
      })

      await transporter.sendMail({
        from: process.env.SMTP_FROM || smtpUser,
        to: email,
        subject: 'SDG - Recuperar contraseña',
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
            <h2 style="color:#10b981">Sistema de Gestión</h2>
            <p>Hola <strong>${user.nombre}</strong>,</p>
            <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
            <a href="${resetUrl}" style="display:inline-block;background:#10b981;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
              Restablecer contraseña
            </a>
            <p style="color:#64748b;font-size:14px">Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora este email.</p>
          </div>
        `,
      })
    } else {
      console.log('=== RESET PASSWORD (SMTP no configurado) ===')
      console.log(`Email: ${email}`)
      console.log(`Token: ${resetToken}`)
      console.log(`URL: ${resetUrl}`)
      console.log('============================================')
    }

    res.json({ message: 'Si el email existe, recibirás un enlace de recuperación' })
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar la solicitud' })
  }
})

router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' })
    }

    user.password = password
    user.resetToken = undefined
    user.resetTokenExpiry = undefined
    await user.save()

    const token = generarToken(user._id)
    res.json({ user, token, message: 'Contraseña actualizada correctamente' })
  } catch (err) {
    res.status(500).json({ error: 'Error al restablecer la contraseña' })
  }
})

module.exports = router
