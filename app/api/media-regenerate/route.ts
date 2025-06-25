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
    // Clone the request for debugging
    const clonedRequest = request.clone();
    const requestText = await clonedRequest.text();
    console.log('Raw request body:', requestText);

    // Parse the request body
    let payload;
    try {
      payload = JSON.parse(requestText);
    } catch (parseError) {
      console.error('Error parsing JSON request:', parseError);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: parseError.message 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    console.log('Parsed payload:', payload);

    // Validate required fields
    if (!payload.type || (!payload.originalUrl && !payload.fileId)) {
      console.error('Missing required fields in payload');
      return new NextResponse(
        JSON.stringify({ 
          error: 'Missing required fields',
          details: 'The request must include type and either originalUrl or fileId' 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    // Forward the request to the n8n webhook WITHOUT timeout
    console.log('Sending request to n8n webhook:', JSON.stringify(payload));
    try {
      const response = await fetch('https://n8n.srv810314.hstgr.cloud/webhook/media-regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'NextJS-API-Client',
        },
        body: JSON.stringify(payload),
        // No signal, so no timeout
      });

      console.log('Response status from n8n:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Get the raw response text for debugging
      const responseText = await response.text();
      console.log('Raw response from n8n:', responseText);

      if (!response.ok) {
        console.error('Error response from n8n:', response.status, response.statusText);
        
        return new NextResponse(
          JSON.stringify({ 
            error: 'Failed to regenerate media', 
            status: response.status,
            statusText: response.statusText,
            responseText: responseText
          }),
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

      // Try to parse the response as JSON
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Error parsing response as JSON:', parseError);
        return new NextResponse(
          JSON.stringify({ 
            error: 'Invalid JSON response from service',
            rawResponse: responseText
          }),
          {
            status: 502,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          }
        );
      }

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
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      
      const errorMessage = fetchError.name === 'AbortError' 
        ? 'Request timed out after 30 seconds'
        : fetchError.message;
        
      return new NextResponse(
        JSON.stringify({ 
          error: 'Failed to connect to media service',
          details: errorMessage
        }),
        {
          status: fetchError.name === 'AbortError' ? 504 : 502,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }
  } catch (error) {
    console.error('Error in media regeneration proxy:', error);
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
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