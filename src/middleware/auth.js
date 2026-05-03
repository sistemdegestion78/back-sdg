const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('JWT_SECRET no configurado o demasiado corto. Configúralo en .env (mínimo 32 caracteres).')
  process.exit(1)
}

function generarToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: '7d',
    algorithm: 'HS256',
  })
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' })
  }
  try {
    const token = header.split(' ')[1]
    if (!token || token.split('.').length !== 3) {
      return res.status(401).json({ error: 'Token mal formado' })
    }
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
    req.userId = decoded.id
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

module.exports = { generarToken, authMiddleware }
