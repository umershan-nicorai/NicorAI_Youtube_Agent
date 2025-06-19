import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Make sure this is always a dynamic route

export async function GET(request: NextRequest) {
  try {
    // Get file ID and type from query parameters
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const type = searchParams.get('type');

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    let url: string;
    
    // Determine the correct URL based on the file type
    if (type === 'image') {
      // For images, use the export=view parameter
      url = `https://drive.google.com/uc?export=view&id=${fileId}`;
    } else if (type === 'video') {
      // For videos, use the direct download URL
      url = `https://drive.google.com/uc?export=download&id=${fileId}`;
    } else {
      // For audio, use the docs.google.com domain which has fewer restrictions
      url = `https://docs.google.com/uc?export=download&id=${fileId}`;
    }

    console.log(`Proxying request for ${type} with ID: ${fileId}`);
    console.log(`Fetching from URL: ${url}`);

    // Fetch the file from Google Drive with more robust headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': 'https://drive.google.com/',
        'Origin': 'https://drive.google.com'
      },
      // Add a longer timeout for larger files
      signal: AbortSignal.timeout(30000) // 30 seconds
    });

    if (!response.ok) {
      console.error(`Error fetching from Google Drive: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch file: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get the file data
    const data = await response.arrayBuffer();
    console.log(`Successfully fetched ${data.byteLength} bytes for ${type} file`);

    // Determine the content type
    let contentType = response.headers.get('content-type') || '';
    console.log(`Original content type from Google Drive: ${contentType}`);
    
    // If content type is not set or is octet-stream, try to infer from the type parameter
    if (!contentType || contentType === 'application/octet-stream') {
      if (type === 'image') contentType = 'image/jpeg';
      else if (type === 'audio') contentType = 'audio/mpeg';
      else if (type === 'video') contentType = 'video/mp4';
      console.log(`Inferred content type: ${contentType}`);
    }

    // Create a new response with the file data and appropriate headers
    const newResponse = new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': data.byteLength.toString(),
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
        'Access-Control-Allow-Headers': 'Content-Type, Range',
        'Accept-Ranges': 'bytes',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Cross-Origin-Embedder-Policy': 'credentialless',
        'Cross-Origin-Opener-Policy': 'same-origin'
      },
    });

    return newResponse;
  } catch (error) {
    console.error('Error in media proxy:', error);
    return NextResponse.json(
      { error: 'Failed to proxy media file', details: error.message },
      { status: 500 }
    );
  }
} 