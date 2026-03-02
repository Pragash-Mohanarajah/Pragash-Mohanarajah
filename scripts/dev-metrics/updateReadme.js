const fs = require("fs")

function updateReadmeSection(section) {
  const markerRegex =
    /<!-- DEV_METRICS_START -->[\s\S]*?<!-- DEV_METRICS_END -->/m

  const readme = fs.readFileSync("README.md", "utf-8")

  const replacement = [
    "<!-- DEV_METRICS_START -->",
    section.trim(),
    "<!-- DEV_METRICS_END -->",
  ].join("\n")

  const updated = readme.match(markerRegex)
    ? readme.replace(markerRegex, replacement)
    : `${readme.trimEnd()}\n\n${replacement}\n`

  fs.writeFileSync("README.md", updated)
}

module.exports = {
  updateReadmeSection,
}

