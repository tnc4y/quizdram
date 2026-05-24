const GOOGLE_URL = 'https://translation.googleapis.com/language/translate/v2'

export async function POST(request: Request) {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY
  if (!key) {
    return Response.json({ error: 'GOOGLE_TRANSLATE_API_KEY tanımlı değil' }, { status: 500 })
  }

  const { texts, from, to } = await request.json() as {
    texts: Record<string, string>
    from: string
    to: string
  }

  const entries = Object.entries(texts).filter(([, v]) => v?.trim())
  if (entries.length === 0) {
    return Response.json({ translations: {} })
  }

  const res = await fetch(`${GOOGLE_URL}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: entries.map(([, v]) => v),
      source: from,
      target: to,
      format: 'text',
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    return Response.json(
      { error: data.error?.message ?? 'Çeviri başarısız' },
      { status: 502 }
    )
  }

  const translations: Record<string, string> = {}
  ;(data.data.translations as { translatedText: string }[]).forEach((t, i) => {
    translations[entries[i][0]] = t.translatedText
  })

  return Response.json({ translations })
}
