const express = require('express')
const mongoose = require('mongoose')

const router = express.Router()

const empresaSchema = new mongoose.Schema(
  {
    nombre:    { type: String, required: true, unique: true },
    rteFuente: { type: Number, required: true },   // ej: 1  → 1 %
    rteIca:    { type: Number, required: true },    // ej: 0.6 → 0.6 %
  },
  { timestamps: true }
)

const Empresa = mongoose.model('Empresa', empresaSchema, 'empresas')

// GET /api/empresas → [{ nombre, rteFuente, rteIca }, ...]
router.get('/', async (req, res) => {
  try {
    const empresas = await Empresa.find().sort({ nombre: 1 }).lean()
    res.json(empresas)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener empresas' })
  }
})

// POST /api/empresas → crea una nueva empresa con sus tasas RTE
router.post('/', async (req, res) => {
  try {
    const { nombre, rteFuente, rteIca } = req.body

    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
      return res.status(400).json({ error: 'Se requiere un nombre de empresa' })
    }
    if (rteFuente == null || rteIca == null) {
      return res.status(400).json({ error: 'Se requiere rteFuente y rteIca' })
    }

    const nombreLimpio = nombre.trim()
    const existe = await Empresa.findOne({ nombre: nombreLimpio })
    if (existe) {
      return res.status(409).json({ error: 'La empresa ya existe' })
    }

    const doc = await Empresa.create({
      nombre:    nombreLimpio,
      rteFuente: Number(rteFuente),
      rteIca:    Number(rteIca),
    })

    res.json({ ok: true, empresa: doc })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al crear empresa' })
  }
})

module.exports = router
