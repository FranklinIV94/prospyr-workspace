import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const client = await prisma.client.findUnique({
      where: { token: params.token },
      include: { 
        positions: { orderBy: { sortOrder: 'asc' } },
        availabilities: true 
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const body = await request.json()
    const { currentStep, isOnboarded } = body

    const updateData: any = {}
    if (currentStep !== undefined) updateData.currentStep = currentStep
    if (isOnboarded !== undefined) {
      updateData.isOnboarded = isOnboarded
      if (isOnboarded) updateData.onboardedAt = new Date()
    }

    const client = await prisma.client.update({
      where: { token: params.token },
      data: updateData,
    })

    return NextResponse.json(client)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
