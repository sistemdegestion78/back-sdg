const mongoose = require('mongoose')

const gastosSchema = new mongoose.Schema({
  acpm: { type: String, default: '' },
  acpmPrecioGalon: { type: String, default: '' },
  acpmGalones: { type: String, default: '' },
  peajes: { type: String, default: '' },
  biaticos: { type: String, default: '' },
  ligaCargue: { type: String, default: '' },
  ligaDescargue: { type: String, default: '' },
  encarpada: { type: String, default: '' },
  descargue: { type: String, default: '' },
  pasajes: { type: String, default: '' },
  hotel: { type: String, default: '' },
  parqueadero: { type: String, default: '' },
  otros: { type: String, default: '' },
}, { _id: false })

const viajeSchema = new mongoose.Schema({
  empresa: { type: String, default: '' },
  mes: { type: Number, default: null },
  anio: { type: Number, default: null },
  fecha: { type: String, default: '' },
  manifiesto: { type: String, default: '' },
  numeroGuia: { type: String, default: '' },
  empresaCliente: { type: String, default: '' },
  clientes: { type: String, default: '' },
  viaje: { type: String, default: '' },
  valorViaje: { type: String, default: '' },
  rteFuente: { type: mongoose.Schema.Types.Mixed, default: '' },
  rteIca: { type: mongoose.Schema.Types.Mixed, default: '' },
  descuentoEmpresa: { type: String, default: '' },
  descuentoTotal: { type: String, default: '' },
  valorNeto: { type: String, default: '' },
  anticipo: { type: String, default: '' },
  saldo: { type: String, default: '' },
  pago: { type: Boolean, default: false },
  gastos: { type: gastosSchema, default: () => ({}) },
}, { timestamps: true })

// Índices compuestos para las consultas más frecuentes
viajeSchema.index({ empresa: 1, mes: 1, anio: 1 })
viajeSchema.index({ mes: 1, anio: 1 })

module.exports = viajeSchema
