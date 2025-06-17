import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  console.log('OPTIONS request received');
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  console.log('POST request received to /api/media-regenerate');
  try {
    const payload = await request.json();
    console.log('Received payload:', payload);

    // Forward the request to the n8n webhook
    const response = await fetch('https://n8n.srv810314.hstgr.cloud/webhook/media-regenerate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Error response from n8n:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      
      return new NextResponse(
        JSON.stringify({ error: 'Failed to regenerate media' }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    const data = await response.json();
    console.log('Successful response from n8n:', data);

    // Return the response with CORS headers
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error in media regeneration proxy:', error);
    
    return new NextResponse(
      JSON.stringify({ error: 'Failed to regenerate media', details: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
} 