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

    // Use local video files from the public directory
    // This is a temporary solution to bypass CORS issues
    const localVideoFiles = [
      '/circle.mp4',
      '/spark.mp4',
      '/ScreenRecording.mp4'
    ];
    
    // Select a file based on the fileId (use modulo to cycle through available files)
    const fileIdNum = parseInt(fileId.replace(/\D/g, '').slice(-2) || '0', 10);
    const selectedFile = localVideoFiles[fileIdNum % localVideoFiles.length];
    
    console.log(`Using local video file: ${selectedFile} instead of Google Drive file ID: ${fileId}`);
    
    // Return a redirect to the local file
    return NextResponse.redirect(new URL(selectedFile, request.url));
    
  } catch (error) {
    console.error('Error in video proxy:', error);
    return NextResponse.json(
      { error: 'Failed to proxy video file', details: error.message },
      { status: 500 }
    );
  }
} 