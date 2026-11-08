const KEYS = ['utm_source', 'utm_medium', 'utm_campaign'] as const
export type UtmAttribution = Partial<Record<typeof KEYS[number], string>>

export function captureUtmAttribution(search: string): UtmAttribution {
  try { if (localStorage.getItem('bidora-campaign-consent') !== 'allowed') return {} } catch { return {} }
  const params = new URLSearchParams(search)
  const values: UtmAttribution = {}
  for (const key of KEYS) {
    const value = params.get(key)?.trim().slice(0, 160)
    if (value) values[key] = value
  }
  if (Object.keys(values).length) {
    try { sessionStorage.setItem('bidora-utm', JSON.stringify(values)) } catch { /* attribution is optional */ }
  }
  return values
}

export function getUtmAttribution(): UtmAttribution {
  try {
    const value = sessionStorage.getItem('bidora-utm')
    if (!value) return {}
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const safe: UtmAttribution = {}
    for (const key of KEYS) {
      const field = (parsed as Record<string, unknown>)[key]
      if (typeof field === 'string') safe[key] = field.slice(0, 160)
    }
    return safe
  } catch { return {} }
}
