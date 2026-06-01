const express = require('express')
const Placa = require('../models/Placa.model')

const router = express.Router()

// GET /api/placas → devuelve array de strings ["TMP836", "WFC474", ...]
router.get('/', async (req, res) => {
  try {
    const placas = await Placa.find().sort({ placa: 1 }).lean()
    res.json(placas.map((p) => p.placa))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener placas' })
  }
})

// POST /api/placas → agrega una nueva placa { placa: "TWV06D" }
router.post('/', async (req, res) => {
  try {
    const { placa } = req.body
    if (!placa || typeof placa !== 'string') {
      return res.status(400).json({ error: 'Se requiere { placa: string }' })
    }
    const placaSanitizada = placa.replace(/-/g, '').toUpperCase().trim()
    if (!placaSanitizada) {
      return res.status(400).json({ error: 'Placa inválida' })
    }
    // Formato colombiano: ABC123 (antigua) o ABC12D (nueva)
    if (!/^[A-Z]{3}[A-Z0-9]{3}$/.test(placaSanitizada)) {
      return res.status(400).json({ error: 'Formato de placa inválido. Use el formato ABC123 o ABC12D' })
    }
    const existe = await Placa.findOne({ placa: placaSanitizada })
    if (existe) {
      return res.status(409).json({ error: 'La placa ya existe' })
    }
    await Placa.create({ placa: placaSanitizada })
    res.json({ ok: true, placa: placaSanitizada })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al agregar placa' })
  }
})

module.exports = router
