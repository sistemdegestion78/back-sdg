const mongoose = require('mongoose')
const viajeSchema = require('../models/Viaje.model')

/**
 * Construye el nombre de la colección a partir de la placa y el tipo.
 * Ejemplo: getColeccion("TMP-836", "viajes") → "TMP836_viajes"
 */
function getColeccion(placa, tipo) {
  const placaSanitizada = placa.replace(/-/g, '').toUpperCase()
  return `${placaSanitizada}_${tipo}`
}

/**
 * Devuelve un modelo Mongoose para la colección dinámica de la placa.
 * Si ya existe en caché de Mongoose lo reutiliza; si no, lo crea.
 */
function getModel(placa, tipo) {
  const nombre = getColeccion(placa, tipo)
  try {
    return mongoose.model(nombre)
  } catch {
    return mongoose.model(nombre, viajeSchema, nombre)
  }
}

module.exports = { getColeccion, getModel }
