const express = require('express')
const { getModel } = require('../utils/coleccion')

const router = express.Router()

// GET /api/:placa/viajes/all - Obtiene TODOS los viajes de una placa sin filtros
router.get('/:placa/viajes/all', async (req, res) => {
  try {
    const { placa } = req.params
    const Viaje = getModel(placa, 'viajes')
    const viajes = await Viaje.find({}).sort({ createdAt: -1 }).lean()
    res.json(viajes)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener viajes' })
  }
})

// GET /api/:placa/viajes?empresa=X&mes=Y&anio=Z
router.get('/:placa/viajes', async (req, res) => {
  try {
    const { placa } = req.params
    const empresa = req.query.empresa || ''
    const mes = req.query.mes != null ? Number(req.query.mes) : null
    const anio = req.query.anio != null ? Number(req.query.anio) : null
    const Viaje = getModel(placa, 'viajes')
    const filter = { empresa }
    if (mes != null && !Number.isNaN(mes)) filter.mes = mes
    if (anio != null && !Number.isNaN(anio)) filter.anio = anio
    const viajes = await Viaje.find(filter).sort({ createdAt: 1 }).lean()
    res.json(viajes)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener viajes' })
  }
})

// POST /api/:placa/viajes
router.post('/:placa/viajes', async (req, res) => {
  try {
    const { placa } = req.params
    const { viajes, empresa, mes, anio } = req.body
    if (!Array.isArray(viajes)) {
      return res.status(400).json({ error: 'Se espera { viajes: [], empresa: string, mes?: number, anio?: number }' })
    }
    const Viaje = getModel(placa, 'viajes')
    const empresaVal = typeof empresa === 'string' ? empresa : ''
    const mesVal = mes != null && !Number.isNaN(Number(mes)) ? Number(mes) : null
    const anioVal = anio != null && !Number.isNaN(Number(anio)) ? Number(anio) : null
    const filter = { empresa: empresaVal }
    if (mesVal != null) filter.mes = mesVal
    if (anioVal != null) filter.anio = anioVal
    await Viaje.deleteMany(filter)
    if (viajes.length > 0) {
      const docs = viajes.map((v) => {
        const { _id, __v, ...rest } = v
        return { ...rest, empresa: empresaVal, mes: mesVal, anio: anioVal }
      })
      await Viaje.insertMany(docs)
    }
    res.json({ ok: true, count: viajes.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al guardar viajes' })
  }
})

module.exports = router
