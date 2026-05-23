import { cookies } from 'next/headers'
import { adminAuth } from '@/lib/firebase-admin'

const SESSION_DURATION_MS = 60 * 60 * 24 * 5 * 1000 // 5 days

export async function POST(request: Request) {
  const { idToken } = await request.json()

  if (!idToken) {
    return Response.json({ error: 'idToken gerekli' }, { status: 400 })
  }

  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    })

    const cookieStore = await cookies()
    cookieStore.set('session', sessionCookie, {
      maxAge: SESSION_DURATION_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    })

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Session cookie oluşturulamadı:', err)
    return Response.json({ error: 'Geçersiz token' }, { status: 401 })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  return Response.json({ ok: true })
}
