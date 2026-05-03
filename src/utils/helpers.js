function toNum(val) {
  const n = Number(val)
  return Number.isFinite(n) ? n : 0
}

module.exports = { toNum }
