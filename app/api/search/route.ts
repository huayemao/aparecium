import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Area } from '@prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query || query.trim().length < 1) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Search for areas matching the query
    const results = await prisma.area.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { id: { contains: query } }
        ]
      },
      orderBy: [
        { id: 'asc' }
      ],
      take: 20 // Limit results for better performance
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
