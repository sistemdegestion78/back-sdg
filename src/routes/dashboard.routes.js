const express = require('express')
const mongoose = require('mongoose')
const { getModel } = require('../utils/coleccion')
const { toNum } = require('../utils/helpers')
const { GASTOS_KEYS } = require('../constants/gastos')

const Placa = mongoose.model('Placa')

const router = express.Router()

function totalGastosDeViaje(gastos = {}) {
  return GASTOS_KEYS.reduce((acc, key) => acc + toNum(gastos[key]), 0)
}

// anioFiltro/mesFiltro: el "viajesDelMes" refleja el filtro activo
function statsDeViajes(viajes, anioFiltro, mesFiltro) {
  const now = new Date()
  const mesParaMes = mesFiltro ?? (now.getMonth() + 1)
  const anioParaMes = anioFiltro ?? now.getFullYear()

  let totalViajes = 0
  let viajesDelMes = 0
  let valorTotal = 0
  let totalAnticipos = 0
  let totalGastos = 0

  for (const v of viajes) {
    totalViajes += 1
    if (v.mes === mesParaMes && v.anio === anioParaMes) viajesDelMes += 1
    valorTotal += toNum(v.valorNeto)
    totalAnticipos += toNum(v.anticipo)
    totalGastos += totalGastosDeViaje(v.gastos)
  }

  const ganancia = valorTotal - totalGastos
  return { totalViajes, viajesDelMes, valorTotal, totalAnticipos, totalGastos, ganancia }
}

async function getPlacasDisponibles() {
  const docs = await Placa.find().sort({ placa: 1 }).lean()
  return docs.map((d) => d.placa)
}

// GET /api/dashboard/stats?anio=2026&mes=3
router.get('/stats', async (req, res) => {
  try {
    const anioFiltro = req.query.anio ? Number(req.query.anio) : null
    const mesFiltro  = req.query.mes  ? Number(req.query.mes)  : null

    const placas = await getPlacasDisponibles()

    const todosLosViajes = []
    const viajesPorPlaca = new Map()

    for (const placa of placas) {
      const Viaje = getModel(placa, 'viajes')
      const filter = {}
      if (anioFiltro) filter.anio = anioFiltro
      if (mesFiltro)  filter.mes  = mesFiltro
      const viajes = await Viaje.find(filter).lean()
      todosLosViajes.push(...viajes)
      viajesPorPlaca.set(placa, viajes)
    }

    const global = statsDeViajes(todosLosViajes, anioFiltro, mesFiltro)

    const porPlaca = []
    for (const [placa, viajes] of viajesPorPlaca) {
      const s = statsDeViajes(viajes, anioFiltro, mesFiltro)

      const empMap = new Map()
      for (const v of viajes) {
        const emp = v.empresa ?? ''
        if (!empMap.has(emp)) empMap.set(emp, [])
        empMap.get(emp).push(v)
      }
      const porEmpresa = []
      for (const [empresa, lista] of empMap) {
        const es = statsDeViajes(lista, anioFiltro, mesFiltro)
        porEmpresa.push({ empresa: empresa || '(Sin empresa)', ...es })
      }
      porEmpresa.sort((a, b) => a.empresa.localeCompare(b.empresa))

      porPlaca.push({ placa, ...s, porEmpresa })
    }
    porPlaca.sort((a, b) => a.placa.localeCompare(b.placa))

    res.json({ global, porPlaca })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener estadísticas' })
  }
})

module.exports = router
