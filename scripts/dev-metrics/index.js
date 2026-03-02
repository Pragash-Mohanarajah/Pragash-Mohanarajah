const { fetchStats } = require("./fetchStats")
const { buildMetricsSection } = require("./sections")
const { updateReadmeSection } = require("./updateReadme")

async function run() {
  let data

  try {
    data = await fetchStats()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to fetch stats:", err)
    process.exitCode = 1
    return
  }

  const section = buildMetricsSection(data)
  updateReadmeSection(section)
}

run()

