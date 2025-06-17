'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

interface FormData {
  topic: string
  tone: 'Professional' | 'Casual' | 'Funny'
  genre: 'Educational' | 'Entertainment' | 'Tutorial'
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    tone: 'Professional',
    genre: 'Educational',
  })
  const [script, setScript] = useState('')
  const [editedScript, setEditedScript] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasScript, setHasScript] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoApproval, setVideoApproval] = useState<'approved' | 'rejected' | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [responseId, setResponseId] = useState<string | null>(null)
  const [responseTimestamp, setResponseTimestamp] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isGeneratingMedia, setIsGeneratingMedia] = useState(false)
  const [mediaGenerated, setMediaGenerated] = useState(false)
  const [generatedMedia, setGeneratedMedia] = useState<any>(null)
  const mediaRefs = useRef<(HTMLAudioElement | HTMLVideoElement)[]>([])
  
  useEffect(() => {
    const handlePlay = (event: Event) => {
      mediaRefs.current.forEach(media => {
        if (media !== event.target && !media.paused) {
          media.pause();
        }
      });
    };

    mediaRefs.current.forEach(media => {
      media.addEventListener('play', handlePlay);
    });

    return () => {
      mediaRefs.current.forEach(media => {
        media.removeEventListener('play', handlePlay);
      });
    };
  }, [mediaGenerated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setHasScript(false)
    try {
      // Generate unique ID and timestamp for initial submission (if needed)
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
      const timestamp = new Date().toISOString()
      const payload = {
        ...formData,
        id,
        timestamp,
      }
      const response = await fetch('https://n8n.srv810314.hstgr.cloud/webhook/frontend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      console.log("Fetch response:", response);
      console.log("Fetch response status:", response.status);
      if (!response.ok) throw new Error('Failed to generate script')
      const data = await response.json()
      setScript(data.content?.text || data.text || "")
      setEditedScript(data.content?.text || data.text || "")
      setVideoUrl(data.videoUrl)
      setHasScript(true)
      setResponseId(data.responseId || null)
      setResponseTimestamp(data.timestamp || null)
    } catch (error) {
      alert('Error generating script. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveEdit = () => {
    setScript(editedScript)
    setIsEditing(false)
    setStatusMessage('Script updated successfully!')
    setTimeout(() => setStatusMessage(''), 2000)
  }

  const handleApproveOrRefineScript = async () => {
    try {
      setIsProcessing(true)
      const status = feedback.trim() ? 'refine' : 'approved';
      const payload = {
        responseId,
        content: { text: editedScript },
        topic: formData.topic,
        tone: formData.tone,
        genre: formData.genre,
        feedback,
        status,
        timestamp: responseTimestamp,
      };
      const response = await fetch('https://n8n.srv810314.hstgr.cloud/webhook/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log("Fetch response:", response);
      console.log("Fetch response status:", response.status);
      if (!response.ok) throw new Error(status === 'refine' ? 'Failed to refine script' : 'Failed to approve script');
      const data = await response.json();
      // Ensure data is not null or undefined
      if (!data) {
        console.error("Backend response data is null or undefined.");
        alert('Error processing script: Received empty or invalid response from backend.');
        setIsProcessing(false);
        return;
      }
      console.log('Backend response data received by frontend:', data);
      console.log('Stringified backend data:', JSON.stringify(data, null, 2));

      if (status === 'refine') {
        const newScript = data.content?.text || data.text || '';
        setScript(newScript);
        setEditedScript(newScript);
        setFeedback('');
        setStatusMessage('Refined script updated!');
        setTimeout(() => setStatusMessage(''), 2000);
      } else {
        // Script approved, now process and show media generation screen using data from n8n response
        setIsGeneratingMedia(true);
        try {
          // Parse the response data which might be in different formats
          console.log("Processing media data...");
          let responseFiles = [];
          
          // Check for "object Object" key structure (from the stringified object)
          if (data && data["object Object"] && data["object Object"].files) {
            console.log("Found files in 'object Object' key");
            responseFiles = data["object Object"].files;
          } 
          // Check if it's a direct object with files property
          else if (data && data.files && Array.isArray(data.files)) {
            console.log("Found direct files array");
            responseFiles = data.files;
          } 
          // Check if it's an array with files in the first element
          else if (Array.isArray(data) && data.length > 0) {
            if (data[0].files && Array.isArray(data[0].files)) {
              console.log("Found files array in first element");
              responseFiles = data[0].files;
            } else {
              console.log("Data is an array but doesn't contain files in expected format");
              responseFiles = data; // Use the array directly if it might be the files
            }
          } 
          // Last resort - try to parse if it's a stringified JSON
          else if (typeof data === 'string') {
            try {
              const parsedData = JSON.parse(data);
              if (parsedData.files) {
                console.log("Parsed string data to get files");
                responseFiles = parsedData.files;
              }
            } catch (e) {
              console.error("Failed to parse string data:", e);
            }
          }
          
          console.log("Files found:", responseFiles.length);
          console.log("Sample file:", responseFiles[0]);

          const extractGoogleDriveFileId = (url: string) => {
            if (!url) return null;
            
            // Handle direct Google Drive "uc" URLs
            if (url.includes('drive.google.com/uc?id=')) {
              const idMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
              return idMatch ? idMatch[1] : null;
            }
            
            // Handle Google Drive file URLs
            if (url.includes('drive.google.com/file/d/')) {
              const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
              return fileIdMatch ? fileIdMatch[1] : null;
            }
            
            // Handle other formats
            const fileIdMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
            return fileIdMatch ? fileIdMatch[1] : null;
          };

          // Use our own proxy API route instead of direct Google Drive links
          const getProxyUrl = (fileId: string, type: string) => {
            if (!fileId) return null;
            // Use our own API route to proxy the request
            return `/api/media-proxy?fileId=${fileId}&type=${type}`;
          };

          const newGeneratedMedia = {
            images: responseFiles.filter((file: any) => file && file.type === 'image').map((file: any) => {
              const fileId = extractGoogleDriveFileId(file.url);
              // Use our proxy API
              const srcUrl = fileId ? getProxyUrl(fileId, 'image') : file.url;
              return { src: srcUrl, alt: file.name, liked: false, name: file.name };
            }),
            audio: responseFiles.filter((file: any) => file && file.type === 'music').map((file: any) => {
              const fileId = extractGoogleDriveFileId(file.url);
              // Use our proxy API for audio
              const srcUrl = fileId ? getProxyUrl(fileId, 'audio') : file.url;
              return { src: srcUrl, name: file.name, liked: false };
            }),
            videos: responseFiles.filter((file: any) => file && file.type === 'visual').map((file: any) => {
              const fileId = extractGoogleDriveFileId(file.url);
              // For videos, store both the proxy URL and the original URL
              const srcUrl = fileId ? getProxyUrl(fileId, 'video') : file.url;
              const originalUrl = file.url;
              return { 
                src: srcUrl, 
                originalUrl: originalUrl,
                fileId: fileId,
                name: file.name, 
                liked: false 
              };
            }),
          };
          
          console.log("Generated media object:", {
            images: newGeneratedMedia.images.length,
            audio: newGeneratedMedia.audio.length,
            videos: newGeneratedMedia.videos.length
          });

          setGeneratedMedia(newGeneratedMedia);
          setMediaGenerated(true);
        } catch (mediaError) {
          alert('Error processing media assets. Please try again.');
          console.error('Media processing error:', mediaError);
        } finally {
          setIsGeneratingMedia(false);
        }
      }
    } catch (error) {
      alert('Error processing script. Please try again.');
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLike = (type: 'images' | 'audio' | 'videos', index: number) => {
    setGeneratedMedia((prevMedia: any) => {
      const newMedia = { ...prevMedia };
      newMedia[type] = newMedia[type].map((item: any, i: number) =>
        i === index ? { ...item, liked: !item.liked } : item
      );
      return newMedia;
    });
  };

  // const handleApproveVideo = async () => {
  //   setVideoApproval('approved')
  //   await fetch('https://your-n8n-endpoint.com/webhook/approve-video', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ videoUrl, status: 'approved' }),
  //   })
  //   alert('Video approved and sent for upload!')
  // }

  // const handleRejectVideo = async () => {
  //   setVideoApproval('rejected')
  //   await fetch('https://your-n8n-endpoint.com/webhook/reject-video', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ videoUrl, status: 'rejected' }),
  //   })
  //   alert('Video rejected and sent for revision!')
  // }

  const handleDownloadScript = () => {
    if (script) {
      const blob = new Blob([script], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'youtube_script.txt'; // Default filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
      {isGeneratingMedia ? (
        <div className="flex flex-col items-center justify-center h-[500px] w-full max-w-2xl bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700 text-white">
          <div className="w-24 h-24 relative mb-6">
            {/* Placeholder for spinning icon */}
            <div className="absolute inset-0 rounded-full border-4 border-t-4 border-red-500 border-opacity-50 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9.243 3.03a1 1 0 01.558 1.155l-1.5 5a1 1 0 01-1.897-.046l-2.5-5A1 1 0 014.243 3.03zm4.243 0a1 1 0 01.558 1.155l-1.5 5a1 1 0 01-1.897-.046l-2.5-5A1 1 0 018.243 3.03zm-1.03 8.92a1 1 0 011.897.046l2.5 5a1 1 0 01-1.794.9l-1.5-5a1 1 0 01-.558-1.155zm-4.243 0a1 1 0 011.897.046l2.5 5a1 1 0 01-1.794.9l-1.5-5a1 1 0 01-.558-1.155z" clipRule="evenodd"></path></svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4">Creating Your Media</h2>
          <p className="text-gray-400 mb-6">Analyzing your Script...</p>
          <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
            <div className="bg-red-500 h-2.5 rounded-full animate-pulse" style={{ width: '52%' }}></div>
          </div>
          <p className="text-gray-400 text-sm">52% complete</p>
        </div>
      ) : mediaGenerated ? (
        <div className="w-full max-w-7xl flex flex-col items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700 w-full">
            <button
              onClick={() => setMediaGenerated(false)} // Go back to script view
              className="mb-6 text-gray-400 hover:text-white flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Generate New Media
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">Assets from the script</h2>
            
            {/* Images section */}
            {generatedMedia.images && generatedMedia.images.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Images <span className="text-gray-400 text-sm">({generatedMedia.images.length})</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {generatedMedia.images.map((image: any, index: number) => (
                    <div key={index} className="bg-gray-700 rounded-lg overflow-hidden shadow-md">
                      <img src={image.src} alt={image.alt} className="w-full h-48 object-cover" crossOrigin="anonymous" />
                      <div className="p-4">
                        <p className="text-white font-semibold flex items-center">
                          {image.alt}
                          <button onClick={() => {}} className="ml-2 focus:outline-none text-gray-400 hover:text-white">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.76 0 3.32.73 4.45 1.95L14 12h6V6l-2.35 2.35z"></path>
                            </svg>
                          </button>
                        </p>
                        <p className="text-gray-400 text-sm mt-1">{image.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audio section */}
            {generatedMedia.audio && generatedMedia.audio.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Generated Audio <span className="text-gray-400 text-sm">({generatedMedia.audio.length})</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {generatedMedia.audio.map((audio: any, index: number) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4 flex flex-col items-start">
                      <audio
                        controls
                        src={audio.src}
                        className="w-full mb-2"
                        crossOrigin="anonymous"
                        preload="metadata"
                        ref={el => {
                          if (el && !mediaRefs.current.includes(el)) {
                            mediaRefs.current.push(el);
                          }
                        }}
                      ></audio>
                      <div>
                        <p className="text-white font-semibold flex items-center">
                          {audio.name}
                          <button onClick={() => {}} className="ml-2 focus:outline-none text-gray-400 hover:text-white">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.76 0 3.32.73 4.45 1.95L14 12h6V6l-2.35 2.35z"></path>
                            </svg>
                          </button>
                        </p>
                        <p className="text-gray-400 text-sm mt-1">{audio.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos section */}
            {generatedMedia.videos && generatedMedia.videos.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Generated Videos <span className="text-gray-400 text-sm">({generatedMedia.videos.length})</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {generatedMedia.videos.map((video: any, index: number) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4">
                      {/* Use iframe for Google Drive videos instead of video element */}
                      {video.fileId ? (
                        <div className="relative w-full pt-[56.25%]"> {/* 16:9 aspect ratio */}
                          <iframe
                            className="absolute top-0 left-0 w-full h-full rounded-md"
                            src={`https://drive.google.com/file/d/${video.fileId}/preview`}
                            title={video.name}
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                          ></iframe>
                        </div>
                      ) : (
                        <video
                          controls
                          src={video.src}
                          className="w-full rounded-md"
                          crossOrigin="anonymous"
                          preload="metadata"
                          playsInline
                          ref={el => {
                            if (el && !mediaRefs.current.includes(el)) {
                              mediaRefs.current.push(el);
                            }
                          }}
                        ></video>
                      )}
                      <div className="mt-2">
                        <p className="text-white font-semibold flex items-center">
                          {video.name}
                          <button onClick={() => {}} className="ml-2 focus:outline-none text-gray-400 hover:text-white">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.76 0 3.32.73 4.45 1.95L14 12h6V6l-2.35 2.35z"></path>
                            </svg>
                          </button>
                        </p>
                        <p className="text-gray-400 text-sm mt-1">{video.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center mt-8">
              <button
                onClick={() => {}}
                className="bg-green-600 text-white py-3 px-6 rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-semibold text-lg transition-colors duration-200"
              >
                Approve Assets
              </button>
            </div>
          </div>
        </div>
      ) : !hasScript ? (
        <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Your YouTube Script</h1>
            <p className="text-gray-400">Generate engaging, professional scripts for your YouTube videos</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-1">Video Topic <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 text-white shadow-sm focus:border-red-500 focus:ring-red-500 px-3 py-2"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tone" className="block text-sm font-medium text-gray-300 mb-1">Tone</label>
                <select
                  id="tone"
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value as FormData['tone'] })}
                  className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 text-white shadow-sm focus:border-red-500 focus:ring-red-500 px-3 py-2"
                >
                  <option value="Professional">Professional</option>
                  <option value="Casual">Casual</option>
                  <option value="Funny">Funny</option>
                </select>
              </div>
              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-gray-300 mb-1">Content Type</label>
                <select
                  id="genre"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value as FormData['genre'] })}
                  className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 text-white shadow-sm focus:border-red-500 focus:ring-red-500 px-3 py-2"
                >
                  <option value="Educational">Educational</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Tutorial">Tutorial</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 font-semibold text-lg transition-colors duration-200"
            >
              {isLoading ? 'Generating...' : 'Generate Script'}
            </button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl">
          <div className="flex-1 bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
              <span className="flex items-center">
                <svg className="w-6 h-6 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6zm2 3a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm3 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                Your YouTube Script
              </span>
              {script && (
                <button
                  onClick={handleDownloadScript}
                  className="bg-gray-600 text-white py-1 px-3 rounded-lg text-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                  title="Download Script"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </button>
              )}
            </h2>
            {isEditing ? (
              <>
                <textarea
                  value={editedScript}
                  onChange={(e) => setEditedScript(e.target.value)}
                  className="w-full h-96 p-4 border border-gray-600 rounded-lg shadow-sm focus:border-red-500 focus:ring-red-500 text-gray-100 bg-gray-900 resize-y"
                />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSaveEdit}
                    className="bg-red-600 text-white py-2 px-6 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-semibold transition-colors duration-200"
                    type="button"
                  >
                    Save Edit
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="prose prose-invert max-w-none bg-gray-900 p-6 rounded-lg border border-gray-700 overflow-auto min-h-[250px] max-h-[410px]">
                  <ReactMarkdown>{script}</ReactMarkdown>
                </div>
              </>
            )}
          </div>

          <div className="lg:w-80 w-full space-y-6">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 4a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2H3zm0 2h14v10H3V6zm0 2H5a1 1 0 011 1v2a1 1 0 01-1 1H3v-4z" clipRule="evenodd"></path></svg>
                Script Details
              </h2>
              <div className="space-y-2">
                <p className="text-gray-300"><span className="font-semibold text-white">Topic:</span> {formData.topic}</p>
                <p className="text-gray-300"><span className="font-semibold text-white">Tone:</span> {formData.tone}</p>
                <p className="text-gray-300"><span className="font-semibold text-white">Type:</span> {formData.genre}</p>
              </div>
            </div>

            {/* Feedback & Actions Section */}
            {!isEditing && (
              <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Feedback & Actions</h3>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-300 mb-2">Feedback (Optional)</label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={e => {
                    setFeedback(e.target.value);
                  }}
                  placeholder="Share your thoughts or suggestions..."
                  className="w-full h-24 rounded-md border border-gray-600 bg-gray-700 text-white shadow-sm focus:border-red-500 focus:ring-red-500 px-3 py-2 resize-y"
                />
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <button
                    onClick={handleApproveOrRefineScript}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold text-base transition-colors duration-200 ${feedback.trim() ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'} text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800`}
                    type="button"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : feedback.trim() ? 'Refine Script' : 'Approve Script'}
                  </button>
                  <button
                    onClick={() => {
                      setHasScript(false)
                      setScript('')
                      setEditedScript('')
                      setFeedback('')
                      setVideoUrl(null)
                      setVideoApproval(null)
                      setMediaGenerated(false) // Reset media generated state
                    }}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 font-semibold text-base transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-700"
                    type="button"
                    disabled={!!feedback.trim()}
                  >
                    Create New Script
                  </button>
                </div>
                {statusMessage && (
                  <div className="mt-4 text-green-500 font-semibold text-center">{statusMessage}</div>
                )}
              </div>
            )}

            {/* Video Preview Section */}
            {videoUrl && !mediaGenerated && (
              <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm3.293-1.293a1 1 0 00-1.414 1.414L7.586 10l-3.707 3.707a1 1 0 101.414 1.414L9 11.414l3.707 3.707a1 1 0 001.414-1.414L10.414 10l3.707-3.707a1 1 0 00-1.414-1.414L9 8.586l-3.707-3.707z" clipRule="evenodd"></path></svg>
                  Video Preview
                </h2>
                <video controls width="100%" src={videoUrl} className="rounded-lg shadow-md border border-gray-700" />
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <button
                    onClick={() => {
                      // handleApproveVideo()
                    }}
                    className="flex-1 py-2 px-4 rounded-full font-semibold text-lg transition-colors duration-200 bg-gray-700 text-green-400 border border-green-600 hover:bg-green-900 hover:text-white"
                  >
                    Approve Video
                  </button>
                  <button
                    onClick={() => {
                      // handleRejectVideo()
                    }}
                    className="flex-1 py-2 px-4 rounded-full font-semibold text-lg transition-colors duration-200 bg-gray-700 text-red-400 border border-red-600 hover:bg-red-900 hover:text-white"
                  >
                    Reject Video
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}