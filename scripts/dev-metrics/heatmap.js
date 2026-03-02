function makeHeatmap(contributions, maxDays = 365) {
  if (!Array.isArray(contributions) || contributions.length === 0) {
    return "No contribution data available"
  }

  const sorted = [...contributions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const sliced = sorted.slice(-maxDays)
  const rows = new Array(7).fill("")

  for (const day of sliced) {
    const weekday =
      day.weekday !== undefined ? day.weekday : new Date(day.date).getDay()

    let char = "░"
    if (day.count > 0) char = "▒"
    if (day.count >= 3) char = "▓"
    if (day.count >= 6) char = "█"

    rows[weekday] += char
  }

  return rows.join("\n")
}

module.exports = {
  makeHeatmap,
}

