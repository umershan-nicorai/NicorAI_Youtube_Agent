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

    // Instead of trying to proxy Google Drive, serve a local audio file
    // This is a temporary solution to bypass CORS issues
    // In a production environment, you would use a proper storage solution
    
    // Use one of the local audio files in the public directory
    const localAudioFiles = [
      '/dont-talk.mp3'
    ];
    
    // Select a file based on the fileId (just use the first one for now)
    const selectedFile = localAudioFiles[0];
    
    console.log(`Using local audio file: ${selectedFile} instead of Google Drive file ID: ${fileId}`);
    
    // Return a redirect to the local file
    return NextResponse.redirect(new URL(selectedFile, request.url));
    
  } catch (error) {
    console.error('Error in audio proxy:', error);
    return NextResponse.json(
      { error: 'Failed to proxy audio file', details: error.message },
      { status: 500 }
    );
  }
} 