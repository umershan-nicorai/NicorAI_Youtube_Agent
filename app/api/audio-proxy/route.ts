import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Make sure this is always a dynamic route

export async function OPTIONS(request: NextRequest) {
  // Handle CORS preflight requests
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    // Get file ID from query parameters
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Create a Google Drive direct download URL
    const googleDriveUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
    
    try {
      // Try to fetch the file from Google Drive
      const response = await fetch(googleDriveUrl);
      
      if (!response.ok) {
        console.error(`Error fetching from Google Drive: ${response.status}`);
        return NextResponse.json(
          { error: 'Failed to fetch audio from Google Drive', status: response.status },
          { status: 502 }
        );
      }
      
      // Get the file content
      const audioData = await response.arrayBuffer();
      
      // Return the audio file with appropriate headers
      return new NextResponse(audioData, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg', // Assuming MP3 format, adjust if needed
          'Content-Disposition': 'inline',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (fetchError) {
      console.error('Error fetching from Google Drive:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch audio from Google Drive', details: fetchError.message },
        { status: 502 }
      );
    }
    
  } catch (error) {
    console.error('Error in audio proxy:', error);
    return NextResponse.json(
      { error: 'Failed to proxy audio file', details: error.message },
      { status: 500 }
    );
  }
} 