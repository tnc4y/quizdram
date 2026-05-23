import { adminStorage } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  const { tmdbUrl, storagePath } = await request.json()

  if (!tmdbUrl || !storagePath) {
    return Response.json({ error: 'tmdbUrl ve storagePath gerekli' }, { status: 400 })
  }

  const imageRes = await fetch(tmdbUrl)
  if (!imageRes.ok) {
    return Response.json({ error: 'Görsel indirilemedi' }, { status: 502 })
  }

  const buffer = Buffer.from(await imageRes.arrayBuffer())
  const contentType = imageRes.headers.get('content-type') ?? 'image/jpeg'

  const bucket = adminStorage.bucket()
  const file = bucket.file(storagePath)

  await file.save(buffer, {
    metadata: { contentType },
    public: true,
  })

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`
  return Response.json({ url: publicUrl })
}
