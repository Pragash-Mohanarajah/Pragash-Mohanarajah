const fs = require("fs")

const SYMBOLS = {
  1: ["█", "░"],
  2: ["⣿", "⣀"],
  3: ["⬛", "⬜"]
}

function bar(percent, version = 1) {
  const [done, empty] = SYMBOLS[version] || SYMBOLS[1]
  const length = 25
  const filled = Math.round((percent / 100) * length)
  return done.repeat(filled) + empty.repeat(length - filled)
}

async function main() {
  const res = await fetch(process.env.STATS_URL, {
    headers: {
      Authorization: `Bearer ${process.env.API_SECRET_TOKEN}`,
    },
  })
  const data = await res.json()

  if (!res.ok) {
    console.error(
      `Error fetching stats: ${res.status} ${res.statusText}`,
      data.error
    )
    process.exit(1)
  }

  const totalLangBytes = Object.values(data.languages.byBytes)
    .reduce((a, b) => a + b, 0)

  const languages = Object.entries(data.languages.byBytes)
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

  const days = data.analysis.byDay.map((count, i) => {
    const pct = (count / data.commits.total) * 100 || 0
    return `${weekdays[i].padEnd(10)} ${bar(pct)} ${pct.toFixed(2)}%`
  }).join("\n")

  const reposByLang = Object.entries(data.languages.byRepoCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang, count]) => `- ${lang}: ${count}`)
    .join("\n")

  const projects = data.repositories.projects
    .slice(0, 5)
    .map(p => `- ${p.name}${p.description ? `: ${p.description.substring(0, 50)}...` : ''}`)
    .join("\n")

  const section = `
## 📊 Development Metrics

### 🐱 My GitHub Data
- 🔥 Current Streak: ${data.activity.streak.current} days
- 🏆 Longest Streak: ${data.activity.streak.longest} days
- ✨ Total Commits (last 90 days): ${data.commits.total}
- 🌟 Stars Earned: ${data.repositories.stars}
- 🚀 Public Repositories: ${data.profile.publicRepos}
- 💖 Followers: ${data.profile.followers}
- 🧠 Estimated Lines of Code: ${data.codeStats.estimatedLinesOfCode.toLocaleString()}

### 💬 Languages
\`\`\`
${languages}
\`\`\`

### 📚 Repos by Language (Top 5)
\`\`\`
${reposByLang}
\`\`\`

### 💻 Recent Projects (Top 5)
\`\`\`
${projects}
\`\`\`

### 📅 Productivity by Day
\`\`\`
${days}
\`\`\`

_Last updated on ${new Date().toUTCString()}_
`

  const readme = fs.readFileSync("README.md", "utf-8")

  const updated = readme.replace(
    /<!-- DEV_METRICS_START -->[\s\S]*<!-- DEV_METRICS_END -->/,
    `<!-- DEV_METRICS_START -->\n${section.trim()}\n<!-- DEV_METRICS_END -->`
  )

  fs.writeFileSync("README.md", updated)
}

main()
