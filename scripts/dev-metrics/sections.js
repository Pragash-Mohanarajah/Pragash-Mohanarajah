const { bar, formatRow } = require("./formatters")
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

  return [
    "### 🐱 GitHub Overview",
    `- 🔥 Current Streak: ${data?.activity?.streak?.current || 0} days`,
    `- 🏆 Longest Streak: ${data?.activity?.streak?.longest || 0} days`,
    `- ✨ Total Commits: ${formatNumber(totalCommits)}`,
    `- 💖 Commit Breakdown: ${formatNumber(publicCommits)} public, ${formatNumber(
      privateCommits
    )} private · ${formatNumber(ownedCommits)} owned, ${formatNumber(contributedCommits)} contributed`,
    `- 🚀 Repositories: ${formatNumber(totalRepos)} (${formatNumber(
      publicRepos
    )} public, ${formatNumber(privateRepos)} private)`,
    `- 👤 Ownership: ${formatNumber(ownedRepos)} owned, ${formatNumber(
      contributedRepos
    )} contributed-to`,
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
    .map(([lang, loc]) => {
      const pct = totalLOC > 0 ? (loc / totalLOC) * 100 : 0
      return `${lang.padEnd(18)} ${bar(pct)} ${pct.toFixed(2)}% (${formatNumber(
        loc
      )} LOC)`
    })
    .join("\n")

  const languageRepoLines = Object.entries(byRepoCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([lang, count]) => {
      const pct = totalRepoCounts > 0 ? (count / totalRepoCounts) * 100 : 0
      return `${lang.padEnd(18)} ${bar(pct)} ${pct.toFixed(2)}% (${formatNumber(
        count
      )} repos)`
    })
    .join("\n")

  const languageByteLines = Object.entries(byBytes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([lang, bytes]) => {
      const pct = totalBytes > 0 ? (bytes / totalBytes) * 100 : 0
      return `${lang.padEnd(18)} ${bar(pct)} ${pct.toFixed(2)}% (${formatNumber(
        bytes
      )} bytes)`
    })
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
      formatRow(cat.padEnd(18), count, totalReposByCat, 25)
    )
    .join("\n")

  const catLocLines = Object.entries(byCategoryLoc)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, loc]) =>
      formatRow(
        `${cat.padEnd(18)} (${formatNumber(loc)} LOC)`,
        loc,
        totalLocByCat,
        25
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
  const totalTopics = Object.values(byTopic).reduce((a, b) => a + b, 0)

  const topicLines = Object.entries(byTopic)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic, count]) => formatRow(topic.padEnd(18), count, totalTopics, 25))
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
    .map((count, i) => formatRow(weekdays[i].padEnd(10), count, totalByDay, 25))
    .join("\n")

  const timeOfDay = {
    "Night (00-06)": byHour.slice(0, 6).reduce((a, b) => a + b, 0),
    "Morning (06-12)": byHour.slice(6, 12).reduce((a, b) => a + b, 0),
    "Afternoon (12-18)": byHour.slice(12, 18).reduce((a, b) => a + b, 0),
    "Evening (18-24)": byHour.slice(18, 24).reduce((a, b) => a + b, 0),
  }

  const totalTimeOfDay = Object.values(timeOfDay).reduce((a, b) => a + b, 0)

  const timeLines = Object.entries(timeOfDay)
    .map(([label, count]) => formatRow(label.padEnd(20), count, totalTimeOfDay, 25))
    .join("\n")

  const byRepository = data?.commits?.byRepository || {}
  const totalCommits = data?.commits?.total || 0

  const activeReposLines = Object.entries(byRepository)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, count]) => {
      const pct = totalCommits > 0 ? (count / totalCommits) * 100 : 0
      return `${name.padEnd(30)} ${bar(pct)} ${pct.toFixed(2)}% (${formatNumber(
        count
      )} commits)`
    })
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
    `_Last updated on ${new Date().toUTCString()}_`,
  ]

  return parts.join("\n")
}

module.exports = {
  buildMetricsSection,
}
