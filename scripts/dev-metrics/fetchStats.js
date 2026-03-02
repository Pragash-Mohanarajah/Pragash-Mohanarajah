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

  const res = await fetchWithRetry(url, {
    headers: {
      Authorization: `Bearer ${process.env.API_SECRET_TOKEN}`,
    },
  })

  return res.json()
}

module.exports = {
  fetchWithRetry,
  fetchStats,
}

