import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: { positions: { orderBy: { sortOrder: 'asc' } } },
    })
    return NextResponse.json(clients)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, linkedinUrl } = await request.json()
    
    const client = await prisma.client.create({
      data: {
        token,
        linkedinUrl,
      },
    })
    
    return NextResponse.json(client)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
