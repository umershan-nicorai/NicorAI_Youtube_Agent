import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // This route will now handle topic submissions, similar to the previous /api/submitTopic
    return NextResponse.json({
      success: true,
      message: 'Topic submitted successfully'
    })
  } catch (error) {
    console.error('Error in API route:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process request' },
      { status: 500 }
    )
  }
} 