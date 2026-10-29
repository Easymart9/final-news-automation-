import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    name: 'World Bulletin',
    url: 'https://worldbulletin.world',
    description: 'AI-assisted technology news with linked source references',
    version: '1.0.0',
    status: 'active'
  }, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}
