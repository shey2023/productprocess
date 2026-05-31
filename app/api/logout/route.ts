import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.redirect(
    new URL('/login', process.env.NEXT_PUBLIC_SITE_URL ?? 'https://productprocess-seven-chi.vercel.app')
  )
  response.cookies.delete('admin_session')
  return response
}
