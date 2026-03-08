const fs = require("fs")
const path = require("path")
const { fetchStats } = require("./fetchStats")
const { buildMetricsSection, generateCommitHistorySvg } = require("./sections")
const { updateReadmeSection } = require("./updateReadme")

async function run() {
  let data

  try {
    // eslint-disable-next-line no-console
    console.log("Fetching stats...")
    data = await fetchStats()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to fetch stats:", err)
    process.exitCode = 1
    return
  }

  if (!data) {
    // eslint-disable-next-line no-console
    console.error("Failed to fetch stats data (empty response).")
    process.exitCode = 1
    return
  }

  const svg = generateCommitHistorySvg(data)
  if (svg) {
    const svgPath = path.resolve(process.cwd(), "commit-history.svg")
    fs.writeFileSync(svgPath, svg)
    console.log("Saved commit history SVG to", svgPath)
  }

  const section = buildMetricsSection(data)
  updateReadmeSection(section)
  // eslint-disable-next-line no-console
  console.log("Updated README.md")
}

run()
