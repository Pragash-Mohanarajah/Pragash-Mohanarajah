async function fetchWithRetry(url, options, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options)

      if (res.ok) return res

      // eslint-disable-next-line no-console
      console.warn(`Attempt ${i + 1} failed: ${res.status} ${res.statusText}`)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`Attempt ${i + 1} failed: ${err.message}`)
    }

    if (i < retries - 1) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise(r => setTimeout(r, delay))
    }
  }

  throw new Error(`Failed to fetch ${url} after ${retries} attempts`)
}

async function fetchStats() {
  const url = process.env.STATS_URL

  if (!url) {
    throw new Error("STATS_URL environment variable is not set")
  }

  const headers = {
    Authorization: `Bearer ${process.env.API_SECRET_TOKEN}`,
    "Content-Type": "application/json",
  }

  // 1. Fetch Core Stats
  // eslint-disable-next-line no-console
  console.log("Fetching core stats...")
  let currentData = await (await fetchWithRetry(`?mode=core`, {
    method: "POST",
    headers,
  })).json()

  // Calculate years to fetch
  const createdDate = new Date(currentData.profile.createdAt)
  const startYear = createdDate.getFullYear()
  const currentYear = new Date().getFullYear()

  // 2. Fetch Year Stats iteratively
  for (let year = currentYear; year >= startYear; year--) {
    // eslint-disable-next-line no-console
    console.log(`Fetching contributions for ${year}...`)
    const res = await fetchWithRetry(`?mode=year&year=${year}`, {
      method: "POST",
      headers,
      body: JSON.stringify(currentData),
    })
    currentData = await res.json()
  }

  // 3. Save Final Stats
  // eslint-disable-next-line no-console
  console.log("Saving aggregated stats...")
  await fetchWithRetry(`?mode=save`, {
    method: "POST",
    headers,
    body: JSON.stringify(currentData),
  })

  return currentData
}

module.exports = {
  fetchWithRetry,
  fetchStats,
}
