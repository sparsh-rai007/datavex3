import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://s.jina.ai/${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Return-Format': 'json',
      },
    });

    if (!response.ok) {
      throw new Error(`Jina AI responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ results: data?.data ? data.data.slice(0, 5) : [] });
  } catch (error: any) {
    console.error('Related links proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
