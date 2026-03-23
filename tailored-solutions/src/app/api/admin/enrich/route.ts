import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getEnrichedProfile } from '@/lib/enrichment'

export async function POST(request: NextRequest) {
  try {
    const { token, linkedinUrl } = await request.json()

    if (!token || !linkedinUrl) {
      return NextResponse.json({ error: 'Missing token or linkedinUrl' }, { status: 400 })
    }

    // Get existing client
    const client = await prisma.client.findUnique({ where: { token } })
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Enrich data
    const enriched = await getEnrichedProfile(linkedinUrl)

    // Update client with enriched data
    const updated = await prisma.client.update({
      where: { token },
      data: {
        firstName: enriched.firstName,
        lastName: enriched.lastName,
        headline: enriched.headline,
        location: enriched.location,
        email: enriched.email,
        phone: enriched.phone,
        isEnriched: true,
        enrichedAt: new Date(),
      },
    })

    // Create positions
    await prisma.position.deleteMany({ where: { clientId: client.id } })
    await prisma.position.createMany({
      data: enriched.positions.map((pos: any) => ({
        clientId: client.id,
        companyName: pos.companyName,
        companyLogo: pos.companyLogo,
        title: pos.title,
        startDate: pos.startDate,
        endDate: pos.endDate,
        isCurrent: pos.isCurrent,
        sortOrder: pos.sortOrder,
      })),
    })

    return NextResponse.json({ success: true, client: updated })
  } catch (e: any) {
    console.error('Enrichment error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
