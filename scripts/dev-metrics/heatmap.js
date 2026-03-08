function generateContributionGraphSvg(contributions) {
  if (!Array.isArray(contributions) || contributions.length === 0) return null

  // Sort by date
  const sorted = [...contributions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const squareSize = 10
  const gap = 2
  const weekWidth = squareSize + gap
  const daysInWeek = 7

  const rects = []
  let col = 0

  sorted.forEach((day, i) => {
    const weekday =
      day.weekday !== undefined ? day.weekday : new Date(day.date).getDay()

    // If it's Sunday and not the very first day, move to the next column
    if (weekday === 0 && i > 0) {
      col++
    }

    const x = col * weekWidth
    const y = weekday * weekWidth

    let color = "#2d333b" // Empty (Dark Mode)

    if (day.count > 0) color = "#0c2d6b" // Level 1
    if (day.count >= 3) color = "#005cc5" // Level 2
    if (day.count >= 6) color = "#388bfd" // Level 3
    if (day.count >= 10) color = "#79c0ff" // Level 4

    rects.push(`<rect x="${x}" y="${y}" width="${squareSize}" height="${squareSize}" fill="${color}" rx="2" ry="2" />`)
  })

  const width = (col + 1) * weekWidth
  const height = daysInWeek * weekWidth

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n    ${rects.join("")}\n  </svg>`
}

module.exports = {
  generateContributionGraphSvg,
}
