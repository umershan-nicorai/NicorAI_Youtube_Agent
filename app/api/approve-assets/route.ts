import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    let data;
    try {
      data = await request.json();
    } catch (error) {
      console.error('Error parsing request JSON:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    console.log('Received request data:', data);

    // Validate the required fields
    if (!data.content || !data.media) {
      return NextResponse.json(
        { error: 'Missing required fields: content and media' },
        { status: 400 }
      );
    }

    // Create the payload for the webhook - keep the media array as is
    const payload = {
      content: data.content,
      media: data.media, // Keep the flat array structure
      Uploaded_media: data.Uploaded_media, // Forward Uploaded_media if present
      responseId: data.responseId,
      timestamp: data.timestamp,
      status: 'approved',
      topic: data.topic,
      tone: data.tone,
      genre: data.genre
    };

    console.log('Sending webhook payload:', payload);

    try {
      // Forward the request to the webhook URL
      const response = await fetch('https://n8n.srv810314.hstgr.cloud/webhook/media-regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Read the response text first
      const responseText = await response.text();
      console.log('Webhook response text:', responseText);

      // Try to parse the response as JSON
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (error) {
        console.error('Error parsing webhook response:', error);
        return NextResponse.json(
          { error: 'Invalid JSON response from webhook', details: responseText },
          { status: 502 }
        );
      }

      if (!response.ok) {
        console.error('Webhook error response:', responseData);
        return NextResponse.json(
          { error: 'Webhook request failed', details: responseData },
          { status: response.status }
        );
      }

      return NextResponse.json(responseData);
    } catch (error) {
      console.error('Error making webhook request:', error);
      return NextResponse.json(
        { error: 'Failed to send request to webhook', details: error.message },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 