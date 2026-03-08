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
  const yearLabelWidth = 35
  const yearGap = 10

  // Group by year
  const byYear = {}
  sorted.forEach(day => {
    const year = new Date(day.date).getFullYear()
    if (!byYear[year]) byYear[year] = []
    byYear[year].push(day)
  })

  // Sort years descending (newest at top)
  const years = Object.keys(byYear).sort((a, b) => b - a)
  
  let svgContent = ""
  let currentY = 0
  let maxWidth = 0

  years.forEach(year => {
    const yearData = byYear[year]
    let col = 0
    const rects = []
    
    yearData.forEach((day, i) => {
      const weekday = day.weekday !== undefined ? day.weekday : new Date(day.date).getDay()
      
      // If Sunday and not the very first day of this year's data, move to next column
      if (weekday === 0 && i > 0) col++
      
      const x = yearLabelWidth + col * weekWidth
      const y = currentY + weekday * weekWidth
      
      let color = "#2d333b" // Empty (Dark Mode)
      if (day.count > 0) color = "#0c2d6b"
      if (day.count >= 3) color = "#005cc5"
      if (day.count >= 6) color = "#388bfd"
      if (day.count >= 10) color = "#79c0ff"

      rects.push(`<rect x="${x}" y="${y}" width="${squareSize}" height="${squareSize}" fill="${color}" rx="2" ry="2" />`)
    })
    
    const yearWidth = yearLabelWidth + (col + 1) * weekWidth
    if (yearWidth > maxWidth) maxWidth = yearWidth
    
    // Add Year Label
    const labelY = currentY + (daysInWeek * weekWidth) / 2 + 4
    svgContent += `<text x="0" y="${labelY}" fill="#ccc" font-family="sans-serif" font-size="10">${year}</text>`
    svgContent += rects.join("")
    
    currentY += daysInWeek * weekWidth + yearGap
  })

  return `<svg width="${maxWidth}" height="${currentY}" xmlns="http://www.w3.org/2000/svg">\n    ${svgContent}\n  </svg>`
}

module.exports = {
  generateContributionGraphSvg,
}
