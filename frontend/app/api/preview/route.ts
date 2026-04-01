import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error(`Microlink responded with ${response.status}`);
    }

    const data = await response.json();
    
    // Extract meaningful snippet
    let snippet = data?.data?.description || data?.data?.title || '';
    if (snippet && snippet.length > 200) {
      snippet = snippet.substring(0, 197) + '...';
    }

    return NextResponse.json({ 
      title: data?.data?.title,
      description: snippet,
      image: data?.data?.image?.url || data?.data?.logo?.url,
      publisher: data?.data?.publisher
    });
  } catch (error: any) {
    console.error('Preview metadata proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
