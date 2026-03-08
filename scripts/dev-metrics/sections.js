const { formatRow } = require("./formatters")
const { makeHeatmap } = require("./heatmap")

function formatNumber(n) {
  if (!Number.isFinite(n)) return "0"
  return n.toLocaleString()
}

function buildOverviewSection(data) {
  const totalLOC = data?.codeStats?.estimatedLinesOfCode || 0
  const totalCommits = data?.commits?.total || 0
  const ownedCommits = data?.commits?.owned || 0
  const contributedCommits = data?.commits?.contributed || 0
  const publicCommits = data?.commits?.public || 0
  const privateCommits = data?.commits?.private || 0

  const totalRepos = data?.repositories?.total || 0
  const publicRepos = data?.repositories?.public || 0
  const privateRepos = data?.repositories?.private || 0
  const ownedRepos = data?.repositories?.owned || 0
  const contributedRepos = data?.repositories?.contributed || 0

  const followers = data?.profile?.followers || 0
  const following = data?.profile?.following || 0
  const accountAgeDays = data?.profile?.accountAgeDays || 0

  const stars = data?.repositories?.stars || 0
  const forks = data?.repositories?.forks || 0
  const watchers = data?.repositories?.watchers || 0
  const archived = data?.repositories?.archived || 0

  const toPct = (val, total) => (total > 0 ? `${((val / total) * 100).toFixed(1)}%` : "0%")

  return [
    "### 🐱 GitHub Overview",
    `- 🔥 Current Streak: ${data?.activity?.streak?.current || 0} days`,
    `- 🏆 Longest Streak: ${data?.activity?.streak?.longest || 0} days`,
    `- ✨ Total Commits: ${formatNumber(totalCommits)}`,
    `- 💖 Commit Breakdown: ${formatNumber(publicCommits)} public (${toPct(publicCommits, totalCommits)}), ${formatNumber(
      privateCommits
    )} private (${toPct(privateCommits, totalCommits)}) · ${formatNumber(ownedCommits)} owned (${toPct(ownedCommits, totalCommits)}), ${formatNumber(contributedCommits)} contributed (${toPct(contributedCommits, totalCommits)})`,
    `- 🚀 Repositories: ${formatNumber(totalRepos)} (${formatNumber(
      publicRepos
    )} public (${toPct(publicRepos, totalRepos)}), ${formatNumber(privateRepos)} private (${toPct(privateRepos, totalRepos)}))`,
    `- 👤 Ownership: ${formatNumber(ownedRepos)} owned (${toPct(ownedRepos, totalRepos)}), ${formatNumber(
      contributedRepos
    )} contributed-to (${toPct(contributedRepos, totalRepos)})`,
    `- ⭐ Stars: ${formatNumber(stars)} · 👀 Watchers: ${formatNumber(
      watchers
    )} · 🍴 Forks: ${formatNumber(forks)} · 🗄️ Archived: ${formatNumber(
      archived
    )}`,
    `- 🧠 Estimated Lines of Code: ${formatNumber(totalLOC)}`,
    `- 🤝 Followers: ${formatNumber(followers)} · Following: ${formatNumber(
      following
    )}`,
    `- 📅 Account age: ${formatNumber(accountAgeDays)} days`,
    "",
  ].join("\n")
}

function buildLanguageSections(data) {
  const byLanguage = data?.analysis?.byLanguage || {}
  const byRepoCount = data?.languages?.byRepoCount || {}
  const byBytes = data?.languages?.byBytes || {}

  const totalLOC = Object.values(byLanguage).reduce((a, b) => a + b, 0)
  const totalRepoCounts = Object.values(byRepoCount).reduce((a, b) => a + b, 0)
  const totalBytes = Object.values(byBytes).reduce((a, b) => a + b, 0)

  const languageLocLines = Object.entries(byLanguage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([lang, loc]) =>
      formatRow(
        lang.padEnd(20),
        loc,
        totalLOC,
        25,
        `(${formatNumber(loc)} LOC)`
      )
    )
    .join("\n")

  const languageRepoLines = Object.entries(byRepoCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([lang, count]) =>
      formatRow(
        lang.padEnd(20),
        count,
        totalRepoCounts,
        25,
        `(${formatNumber(count)} repos)`
      )
    )
    .join("\n")

  const languageByteLines = Object.entries(byBytes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([lang, bytes]) =>
      formatRow(
        lang.padEnd(20),
        bytes,
        totalBytes,
        25,
        `(${formatNumber(bytes)} bytes)`
      )
    )
    .join("\n")

  return [
    "### 📝 Lines of Code by Language",
    "```",
    languageLocLines,
    "```",
    "",
    "### 📚 Top Languages (by Repo Count)",
    "```",
    languageRepoLines,
    "```",
    "",
    "### 💾 Languages by Code Size (Bytes)",
    "```",
    languageByteLines,
    "```",
    "",
  ].join("\n")
}

function buildCategorySection(data) {
  const byCategoryCount = data?.repositories?.byCategory || {}
  const byCategoryLoc = data?.analysis?.byCategory || {}

  const totalReposByCat = Object.values(byCategoryCount).reduce(
    (a, b) => a + b,
    0
  )
  const totalLocByCat = Object.values(byCategoryLoc).reduce((a, b) => a + b, 0)

  const catCountLines = Object.entries(byCategoryCount)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) =>
      formatRow(
        cat.padEnd(20),
        count,
        totalReposByCat,
        25,
        `(${formatNumber(count)} repos)`
      )
    )
    .join("\n")

  const catLocLines = Object.entries(byCategoryLoc)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, loc]) =>
      formatRow(
        cat.padEnd(20),
        loc,
        totalLocByCat,
        25,
        `(${formatNumber(loc)} LOC)`
      )
    )
    .join("\n")

  return [
    "### 🧩 Project Categories (by Repo Count)",
    "```",
    catCountLines,
    "```",
    "",
    "### 🧮 Project Categories (by Estimated LOC)",
    "```",
    catLocLines,
    "```",
    "",
  ].join("\n")
}

function buildTopicsSection(data) {
  const byTopic = data?.repositories?.byTopic || {}
  const totalRepos = data?.repositories?.total || 0

  const topicLines = Object.entries(byTopic)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic, count]) =>
      formatRow(
        topic.padEnd(20),
        count,
        totalRepos,
        25,
        `(${formatNumber(count)} repos)`
      )
    )
    .join("\n")

  return [
    "### 🏷️ Top Topics",
    "```",
    topicLines,
    "```",
    "",
  ].join("\n")
}

function buildProjectsSection(data) {
  const projects = Array.isArray(data?.repositories?.projects)
    ? data.repositories.projects
    : []
  const commitsByRepo = data?.commits?.byRepository || {}

  const enriched = projects.map(p => {
    const fullName = p.fullName || p.name
    const commits = commitsByRepo[fullName] || commitsByRepo[p.name] || 0
    return { ...p, fullName, commits }
  })

  const owned = enriched
    .filter(p => p.relationship === "owned")
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 5)

  const contributed = enriched
    .filter(p => p.relationship === "contributed")
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 5)

  const formatProject = p => {
    const description =
      p.description && p.description.length > 80
        ? `${p.description.slice(0, 77)}...`
        : p.description || ""

    const metaParts = []
    if (p.category) metaParts.push(p.category)
    if (typeof p.commits === "number" && p.commits > 0) {
      metaParts.push(`${p.commits} commits`)
    }
    if (p.isPrivate) metaParts.push("private")

    const meta = metaParts.length ? ` _(${metaParts.join(" · ")})_` : ""

    return `- ${p.fullName}${description ? ` — ${description}` : ""}${meta}`
  }

  const ownedLines = owned.map(formatProject).join("\n") || "- No owned projects found"
  const contribLines =
    contributed.map(formatProject).join("\n") || "- No contributed projects found"

  return [
    "### 🚀 Top Owned Projects",
    ownedLines,
    "",
    "### 🤝 Top Contributed Projects",
    contribLines,
    "",
  ].join("\n")
}

function buildActivitySections(data) {
  const byDay = data?.analysis?.byDay || Array(7).fill(0)
  const byHour = data?.analysis?.byHour || Array(24).fill(0)

  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]

  const totalByDay = byDay.reduce((a, b) => a + b, 0)

  const dayLines = byDay
    .map((count, i) =>
      formatRow(
        weekdays[i].padEnd(20),
        count,
        totalByDay,
        25,
        `(${formatNumber(count)} contributions)`
      )
    )
    .join("\n")

  const timeOfDay = {
    "Night (00-06)": byHour.slice(0, 6).reduce((a, b) => a + b, 0),
    "Morning (06-12)": byHour.slice(6, 12).reduce((a, b) => a + b, 0),
    "Afternoon (12-18)": byHour.slice(12, 18).reduce((a, b) => a + b, 0),
    "Evening (18-24)": byHour.slice(18, 24).reduce((a, b) => a + b, 0),
  }

  const totalTimeOfDay = Object.values(timeOfDay).reduce((a, b) => a + b, 0)

  const timeLines = Object.entries(timeOfDay)
    .map(([label, count]) =>
      formatRow(
        label.padEnd(20),
        count,
        totalTimeOfDay,
        25,
        `(${formatNumber(count)} commits)`
      )
    )
    .join("\n")

  const byRepository = data?.commits?.byRepository || {}
  const totalCommits = data?.commits?.total || 0

  const activeReposLines = Object.entries(byRepository)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, count]) =>
      formatRow(
        name.padEnd(75),
        count,
        totalCommits,
        25,
        `(${formatNumber(count)} commits)`
      )
    )
    .join("\n")

  return [
    "### 📅 Productivity by Time of Day",
    "```",
    timeLines,
    "```",
    "",
    "### 📅 Productivity by Day",
    "```",
    dayLines,
    "```",
    "",
    "### 📦 Most Active Repositories",
    "```",
    activeReposLines,
    "```",
    "",
  ].join("\n")
}

function buildRecentSection(data) {
  const recentActivityList = Array.isArray(data?.activity?.recent)
    ? data.activity.recent
    : []
  const recentStarsList = Array.isArray(data?.activity?.recentStars)
    ? data.activity.recentStars
    : []
  const contributions = Array.isArray(data?.activity?.contributions)
    ? data.activity.contributions
    : []

  const recentActivityLines =
    recentActivityList
      .map(c => `- ${c.repo} — ${c.message}`)
      .join("\n") || "- No recent public activity"

  const recentStarsLines =
    recentStarsList.map(s => `- ${s.repo}`).join("\n") || "- No recent stars"

  const heatmap = makeHeatmap(contributions)

  return [
    "### ⚡ Recent Activity",
    recentActivityLines,
    "",
    "### 🌟 Recent Stars",
    recentStarsLines,
    "",
    "### 📅 Contribution Graph (last 365 days)",
    "```",
    heatmap,
    "```",
    "",
  ].join("\n")
}

function generateCommitHistorySvg(data) {
  const history = data?.activity?.commitHistory || []
  if (history.length < 2) return null

  const width = 540
  const height = 160
  const padding = 30

  const maxCommits = history[history.length - 1]?.total || 1
  const startDate = new Date(history[0]?.date).getTime()
  const endDate = new Date(history[history.length - 1]?.date).getTime()
  const dateRange = Math.max(1, endDate - startDate)

  // Downsample points for performance/simplicity if there are many
  const maxPoints = 365 // roughly one point per day for a year
  const filteredHistory =
    history.length > maxPoints
      ? history.filter((_, i) => i % Math.ceil(history.length / maxPoints) === 0)
      : history

  const points = filteredHistory
    .map(point => {
      const x =
        ((new Date(point.date).getTime() - startDate) / dateRange) *
          (width - padding * 2) +
        padding
      const y = height - padding - (point.total / maxCommits) * (height - padding * 2)
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(" ")

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>.line{fill:none;stroke:#4ec9b0;stroke-width:1.5}.axis{stroke:#555;stroke-width:1;opacity:0.5}.label{fill:#999;font-family:sans-serif;font-size:10px;text-anchor:middle}</style>
      <line class="axis" x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" />
      <line class="axis" x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" />
      <text class="label" x="${padding / 2}" y="${padding}">${formatNumber(maxCommits)}</text>
      <text class="label" x="${padding / 2}" y="${height - padding + 4}">0</text>
      <text class="label" x="${padding}" y="${height - padding / 2.5}">${new Date(startDate).getFullYear()}</text>
      <text class="label" x="${width - padding}" y="${height - padding / 2.5}">${new Date(endDate).getFullYear()}</text>
      <polyline class="line" points="${points}" />
    </svg>
  `
}

function buildCommitHistoryChart(data) {
  const history = data?.activity?.commitHistory || []
  if (history.length < 2) return ""
  return ["### 📈 All-Time Commit History", "![Commit History](./commit-history.svg)", ""].join("\n")
}

function buildMetricsSection(data) {
  const parts = [
    "## 📊 Development Metrics",
    "",
    buildOverviewSection(data),
    buildLanguageSections(data),
    buildCategorySection(data),
    buildTopicsSection(data),
    buildProjectsSection(data),
    buildActivitySections(data),
    buildRecentSection(data),
    buildCommitHistoryChart(data),
    `_Last updated on ${new Date().toUTCString()}_`,
  ]

  return parts.join("\n")
}

module.exports = {
  buildMetricsSection,
  generateCommitHistorySvg,
}
