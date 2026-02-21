const fs = require("fs")

const SYMBOLS = {
  1: ["█", "░"],
  2: ["⣿", "⣀"],
  3: ["⬛", "⬜"]
}

function bar(percent, version = 1) {
  const [done, empty] = SYMBOLS[version]
  const length = 25
  const filled = Math.round((percent / 100) * length)
  return done.repeat(filled) + empty.repeat(length - filled)
}

async function main() {
  const res = await fetch(process.env.STATS_URL)
  const data = await res.json()

  const totalLangBytes = Object.values(data.languages.bytes)
    .reduce((a, b) => a + b, 0)

  const languages = Object.entries(data.languages.bytes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([lang, bytes]) => {
      const pct = (bytes / totalLangBytes) * 100
      return `${lang.padEnd(15)} ${bar(pct)} ${pct.toFixed(2)}%`
    })
    .join("\n")

  const weekdays = [
    "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
  ]

  const days = data.commits.byDay.map((count, i) => {
    const pct = (count / data.commits.total) * 100 || 0
    return `${weekdays[i].padEnd(10)} ${bar(pct)} ${pct.toFixed(2)}%`
  }).join("\n")

  const section = `
## 📊 Development Metrics

💬 Languages:
\`\`\`
${languages}
\`\`\`

📅 Productivity by Day:
\`\`\`
${days}
\`\`\`

🧠 Profile Summary
- Public Repositories: ${data.profile.publicRepos}
- Followers: ${data.profile.followers}
- Stars Earned: ${data.repos.stars}
- Total Commits (recent): ${data.commits.total}
`

  const readme = fs.readFileSync("README.md", "utf-8")

  const updated = readme.replace(
    /<!-- DEV_METRICS_START -->[\s\S]*<!-- DEV_METRICS_END -->/,
    `<!-- DEV_METRICS_START -->${section}<!-- DEV_METRICS_END -->`
  )

  fs.writeFileSync("README.md", updated)
}

main()
