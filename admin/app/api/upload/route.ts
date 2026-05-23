import { adminStorage } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  const form = await request.formData()
  const file = form.get('file') as File | null
  const path = form.get('path') as string | null

  if (!file || !path) {
    return Response.json({ error: 'file ve path gerekli' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const bucket = adminStorage.bucket()
  const ref = bucket.file(path)

  await ref.save(buffer, {
    metadata: { contentType: file.type || 'image/jpeg' },
    public: true,
  })

  const url = `https://storage.googleapis.com/${bucket.name}/${path}`
  return Response.json({ url })
}
