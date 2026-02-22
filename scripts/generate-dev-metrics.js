const fs = require("fs")

const SYMBOLS = {
  1: ["█", "░"],
  2: ["⣿", "⣀"],
  3: ["⬛", "⬜"]
}

function bar(percent, version = 1) {
  const [done, empty] = SYMBOLS[version] || SYMBOLS[1]
  const length = 25
  const p = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0))
  const filled = Math.round((p / 100) * length)
  return done.repeat(filled) + empty.repeat(length - filled)
}

function makeHeatmap(data) {
  if (!data || data.length === 0) return "No contribution data available"
  
  const rows = new Array(7).fill("")
  
  data.forEach(day => {
    const weekday = day.weekday !== undefined ? day.weekday : new Date(day.date).getDay()
    
    let char = "░"
    if (day.count > 0) char = "▒"
    if (day.count >= 3) char = "▓"
    if (day.count >= 6) char = "█"
    
    rows[weekday] += char
  })
  
  return rows.join("\n")
}

async function fetchWithRetry(url, options, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options)
      if (res.ok) return res
      console.warn(`Attempt ${i + 1} failed: ${res.status} ${res.statusText}`)
    } catch (err) {
      console.warn(`Attempt ${i + 1} failed: ${err.message}`)
    }
    if (i < retries - 1) await new Promise(r => setTimeout(r, delay))
  }
  throw new Error(`Failed to fetch ${url} after ${retries} attempts`)
}

async function main() {
  let data
  try {
    const res = await fetchWithRetry(process.env.STATS_URL, {
      headers: {
        Authorization: `Bearer ${process.env.API_SECRET_TOKEN}`,
      },
    })
    data = await res.json()
  } catch (e) {
    console.error("Failed to fetch stats:", e)
    process.exit(1)
  }

  const totalLOC = data?.codeStats?.estimatedLinesOfCode || 0
  const totalCommits = data?.commits?.total || 0
  const publicCommits = data?.commits?.public || 0
  const privateCommits = data?.commits?.private || 0
  const publicRepos = data?.repositories?.public || 0
  const privateRepos = data?.repositories?.private || 0
  const byLanguage = data?.analysis?.byLanguage || {}
  const byDay = data?.analysis?.byDay || Array(7).fill(0)
  const byHour = data?.analysis?.byHour || Array(24).fill(0)
  const byRepository = data?.commits?.byRepository || {}
  const byRepoCount = data?.languages?.byRepoCount || {}
  const projectsList = data?.repositories?.projects || []
  const recentActivityList = data?.activity?.recent || []
  const recentStarsList = data?.activity?.recentStars || []
  const contributions = data?.activity?.contributions || []

  const languages = Object.entries(byLanguage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([lang, loc]) => {
      const pct = totalLOC > 0 ? (loc / totalLOC) * 100 : 0
      return `${lang.padEnd(15)} ${bar(pct)} ${pct.toFixed(2)}% (${loc.toLocaleString()} LOC)`
    })
    .join("\n")

  const weekdays = [
    "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
  ]

  const totalContributions = byDay.reduce((a, b) => a + b, 0)

  const days = byDay.map((count, i) => {
    const pct = totalContributions > 0 ? (count / totalContributions) * 100 : 0
    return `${weekdays[i].padEnd(10)} ${bar(pct)} ${pct.toFixed(2)}%`
  }).join("\n")

  const timeOfDay = {
    "Night (00-06)": byHour.slice(0, 6).reduce((a, b) => a + b, 0),
    "Morning (06-12)": byHour.slice(6, 12).reduce((a, b) => a + b, 0),
    "Afternoon (12-18)": byHour.slice(12, 18).reduce((a, b) => a + b, 0),
    "Evening (18-24)": byHour.slice(18, 24).reduce((a, b) => a + b, 0),
  }

  const totalTimeOfDay = Object.values(timeOfDay).reduce((a, b) => a + b, 0)

  const hours = Object.entries(timeOfDay).map(([label, count]) => {
    const pct = totalTimeOfDay > 0 ? (count / totalTimeOfDay) * 100 : 0
    return `${label.padEnd(20)} ${bar(pct)} ${pct.toFixed(2)}%`
  }).join("\n")

  const activeRepos = Object.entries(byRepository)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => {
      const pct = totalCommits > 0 ? (count / totalCommits) * 100 : 0
      return `${name.padEnd(15)} ${bar(pct)} ${pct.toFixed(2)}% (${count} commits)`
    })
    .join("\n")

  const totalRepoCounts = Object.values(byRepoCount).reduce((a, b) => a + b, 0)

  const reposByLang = Object.entries(byRepoCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang, count]) => {
      const pct = totalRepoCounts > 0 ? (count / totalRepoCounts) * 100 : 0
      return `${lang.padEnd(15)} ${bar(pct)} ${pct.toFixed(2)}% (${count})`
    })
    .join("\n")

  const projects = projectsList
    .slice(0, 5)
    .map(p => `- ${p.name}${p.description ? `: ${p.description.substring(0, 50)}...` : ''}`)
    .join("\n")

  const recentActivity = recentActivityList
    .map(c => `- ${c.repo} - ${c.message}`)
    .join("\n")

  const recentStars = recentStarsList
    .map(s => `- ${s.repo}`)
    .join("\n")

  const heatmap = makeHeatmap(contributions)

  const section = `
## 📊 Development Metrics

### 🐱 My GitHub Data
- 🔥 Current Streak: ${data?.activity?.streak?.current || 0} days
- 🏆 Longest Streak: ${data?.activity?.streak?.longest || 0} days
- ✨ Total Commits (last year): ${totalCommits} (${publicCommits} public, ${privateCommits} private)
- 🌟 Stars Earned: ${data?.repositories?.stars || 0}
- 🚀 Repositories: ${data?.repositories?.total || 0} (${publicRepos} public, ${privateRepos} private)
- 💖 Followers: ${data?.profile?.followers || 0}
- 🧠 Estimated Lines of Code: ${totalLOC.toLocaleString()}

### 📝 Lines of Code by Language
\`\`\`
${languages}
\`\`\`

### 📚 Top Languages (by Repo Count)
\`\`\`
${reposByLang}
\`\`\`

### 💻 Recent Projects (Top 5)
\`\`\`
${projects}
\`\`\`

### 💻 Most Active Repos (Last Year)
\`\`\`
${activeRepos}
\`\`\`

### ⚡ Recent Activity
${recentActivity}

### 🌟 Recent Stars
${recentStars}

### 📅 Contribution Graph
\`\`\`
${heatmap}
\`\`\`

### 📅 Productivity by Time of Day
\`\`\`
${hours}
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
