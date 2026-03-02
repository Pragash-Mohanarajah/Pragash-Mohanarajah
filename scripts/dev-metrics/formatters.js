const SYMBOLS = {
  1: ["█", "░"],
  2: ["⣿", "⣀"],
  3: ["⬛", "⬜"],
}

function clampPercent(value) {
  if (!Number.isFinite(value)) return 0
  if (value < 0) return 0
  if (value > 100) return 100
  return value
}

function bar(percent, length = 25, version = Number(process.env.SYMBOL_VERSION) || 1) {
  const [done, empty] = SYMBOLS[version] || SYMBOLS[1]
  const p = clampPercent(percent)
  const filled = Math.round((p / 100) * length)

  return done.repeat(filled) + empty.repeat(length - filled)
}

function formatRow(label, value, total, length = 25) {
  const pct = total > 0 ? (value / total) * 100 : 0
  const pctStr = `${pct.toFixed(2)}%`.padStart(7)

  return `${label} ${bar(pct, length)} ${pctStr}`
}

module.exports = {
  SYMBOLS,
  bar,
  formatRow,
}

