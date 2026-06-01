const mongoose = require('mongoose')

const placaSchema = new mongoose.Schema(
  { placa: { type: String, required: true, unique: true } },
  { timestamps: true }
)

module.exports = mongoose.models.Placa || mongoose.model('Placa', placaSchema, 'placas')
