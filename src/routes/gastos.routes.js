const express = require('express')
const { toNum } = require('../utils/helpers')
const { GASTOS_KEYS } = require('../constants/gastos')

const router = express.Router()

// Total = suma de todas las variables de gastos. Saldo = anticipo - total.
router.post('/calcular', (req, res) => {
  const { gastos = {}, anticipo = 0 } = req.body
  const total = GASTOS_KEYS.reduce((acc, key) => acc + toNum(gastos[key]), 0)
  const saldo = toNum(anticipo) - total
  res.json({ total, saldo })
})

module.exports = router
