const app = require('../src/app')
const { connectDB } = require('../src/config/db')

module.exports = async (req, res) => {
  try {
    await connectDB()
  } catch (err) {
    console.error('DB connection error:', err)
    return res.status(500).json({ error: 'Database connection failed' })
  }
  return app(req, res)
}
