import { NextResponse } from 'next/server';
import { prisma } from '@axum/database';

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: [{ region: 'asc' }, { city: 'asc' }],
    });

    // Group by region -> cities
    const regionsMap: Record<string, Set<string>> = {};
    for (const loc of locations) {
      if (!regionsMap[loc.region]) {
        regionsMap[loc.region] = new Set();
      }
      regionsMap[loc.region].add(loc.city);
    }

    const structured = Object.entries(regionsMap).map(([region, cities]) => ({
      region,
      cities: Array.from(cities),
    }));

    return NextResponse.json({
      locations,
      structured,
    });
  } catch (error) {
    console.error('Fetch locations error:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

