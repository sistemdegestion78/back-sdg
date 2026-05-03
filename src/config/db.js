const mongoose = require('mongoose')

let cached = null

async function connectDB() {
  if (cached && mongoose.connection.readyState === 1) return cached

  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/sdg'
  console.log('DB:', uri.replace(/:[^:@]+@/, ':***@').split('?')[0])

  try {
    cached = await mongoose.connect(uri)
    console.log('MongoDB conectado')
    return cached
  } catch (err) {
    console.error('Error conectando a MongoDB:', err.message)
    throw err
  }
}

module.exports = { connectDB }
