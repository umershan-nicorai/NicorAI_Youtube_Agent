'use client'

import { useState, useRef, useEffect } from 'react'
import TopicSection from './components/topic_section'
import ScriptSection from './components/script_section'
import AssetSection from './components/asset_section'
import { useRouter } from 'next/navigation'

interface FormData {
  topic: string
  tone: 'Professional' | 'Casual' | 'Funny'
  genre: 'Educational' | 'Entertainment' | 'Tutorial'
  time: string
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    tone: 'Professional',
    genre: 'Educational',
    time: '20',
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
  const [regeneratingAsset, setRegeneratingAsset] = useState<{ type: 'images' | 'audio' | 'videos', index: number } | null>(null)
  const mediaRefs = useRef<(HTMLAudioElement | HTMLVideoElement)[]>([])
  const [isApprovingAssets, setIsApprovingAssets] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successProgress, setSuccessProgress] = useState(0)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [localImages, setLocalImages] = useState<any[]>([])
  const [localAudio, setLocalAudio] = useState<any[]>([])
  const [localVideos, setLocalVideos] = useState<any[]>([])
  const [localThumbnails, setLocalThumbnails] = useState<any[]>([])
  const router = useRouter()
  
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

  const getProxyUrl = (fileId: string, type: string) => {
    if (!fileId) return null;
    // Use our own API route to proxy the request
    if (type === 'audio') {
      return `/api/audio-proxy?fileId=${fileId}`; // Use dedicated audio proxy for audio files
    }
    return `/api/media-proxy?fileId=${fileId}&type=${type}`;
  };

  // Add a utility function to create a direct download link for Google Drive files
  const getDirectDownloadUrl = (fileId: string) => {
    if (!fileId) return null;
    return `https://docs.google.com/uc?export=download&id=${fileId}`;
  };

  const handleRegenerateMedia = async (type: 'images' | 'audio' | 'videos', index: number, feedback?: string) => {
    setRegeneratingAsset({ type, index });
    const asset = generatedMedia[type][index];
    
    console.log('Current asset being regenerated:', {
      type,
      index,
      asset,
      originalUrl: asset.originalUrl,
      src: asset.src,
      name: asset.name,
      alt: asset.alt,
      fileId: asset.fileId
    });
    
    // Map the frontend asset type to backend expected type
    const getBackendType = (frontendType: string) => {
      switch (frontendType) {
        case 'images':
          return 'image';
        case 'videos':
          return 'video';
        case 'audio':
          return 'audio';
        default:
          return frontendType;
      }
    };

    const payload = {
      name: asset.name || asset.alt,
      type: getBackendType(type),
      originalUrl: asset.originalUrl || asset.src, // Include original URL if available
      fileId: asset.fileId, // Include file ID if available
      feedback: feedback || ''
    };
    
    console.log('Payload being sent to backend:', payload);

    try {
      // Show a loading state
      setRegeneratingAsset({ type, index });
      
      const response = await fetch('/api/media-regenerate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      // Get the response text first for better error handling
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      // Try to parse the response as JSON
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response from server: ' + responseText);
      }

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to regenerate media asset';
        const details = data.details ? `: ${data.details}` : '';
        throw new Error(errorMessage + details);
      }

      console.log('Response received from backend:', data);
      
      if (data && data.file) {
        console.log('New file data:', {
          url: data.file.url,
          name: data.file.name,
          type: data.file.type
        });
        
        setGeneratedMedia((prevMedia: any) => {
          const newMedia = { ...prevMedia };
          const fileId = extractGoogleDriveFileId(data.file.url);
          const newAsset = { 
            ...asset,
            src: fileId ? getProxyUrl(fileId, type) : data.file.url,
            originalUrl: data.file.url,
            directDownloadUrl: fileId ? getDirectDownloadUrl(fileId) : null,
            name: data.file.name,
            fileId: fileId
          };
          
          if (type === 'images') {
            newMedia.images = newMedia.images.map((item: any, i: number) => 
              i === index ? { ...newAsset, alt: data.file.name } : item
            );
          } else if (type === 'audio') {
            newMedia.audio = newMedia.audio.map((item: any, i: number) => 
              i === index ? newAsset : item
            );
          } else if (type === 'videos') {
            newMedia.videos = newMedia.videos.map((item: any, i: number) => 
              i === index ? newAsset : item
            );
          }
          console.log('Updated media state:', newMedia);
          return newMedia;
        });
      } else {
        console.warn('Regeneration response missing file data:', data);
        alert('Regeneration successful but new asset data is missing. Please check the console for details.');
      }

    } catch (error) {
      console.error('Error regenerating media asset:', error);
      
      // Show a more user-friendly error message
      const errorMessage = error.message || 'Unknown error occurred';
      alert(`Error regenerating media asset: ${errorMessage}. Please try again or check the console for details.`);
    } finally {
      setRegeneratingAsset(null);
    }
  };

  // Create a global play handler function that will be used for all media elements
  const handleMediaPlay = (event: React.SyntheticEvent<HTMLAudioElement | HTMLVideoElement>) => {
    // Get the current target that started playing
    const currentTarget = event.currentTarget;
    
    // Pause all other media elements
    mediaRefs.current.forEach(media => {
      if (media !== currentTarget && !media.paused) {
        media.pause();
      }
    });
  };
  
  // Clear mediaRefs when component unmounts or when media is regenerated
  useEffect(() => {
    return () => {
      mediaRefs.current = [];
    };
  }, [mediaGenerated]);

  useEffect(() => {
    if (showSuccessMessage) {
      // Hide message after 3 seconds (1s delay + 0.8s animation + 1.2s display time)
      const timeout = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [showSuccessMessage]);

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
      setLoadingProgress(0)
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

      if (status === 'approved') {
        setIsGeneratingMedia(true);
      }

      setLoadingProgress(10)
      const response = await fetch('https://n8n.srv810314.hstgr.cloud/webhook/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      setLoadingProgress(30)
      
      if (!response.ok) throw new Error(status === 'refine' ? 'Failed to refine script' : 'Failed to approve script');
      
      const data = await response.json();
      
      if (!data) {
        console.error("Backend response data is null or undefined.");
        alert('Error processing script: Received empty or invalid response from backend.');
        setIsProcessing(false);
        setIsGeneratingMedia(false);
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
        try {
          setLoadingProgress(50)
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

          const newGeneratedMedia = {
            images: responseFiles.filter((file: any) => file && file.type === 'image').map((file: any) => {
              const fileId = extractGoogleDriveFileId(file.url);
              const srcUrl = fileId ? getProxyUrl(fileId, 'image') : file.url;
              return {
                src: srcUrl,
                originalUrl: file.url,
                fileId: fileId,
                directDownloadUrl: fileId ? getDirectDownloadUrl(fileId) : null,
                alt: file.name,
                name: file.name,
                liked: false
              };
            }),
            thumbnails: responseFiles.filter((file: any) => file && file.type === 'thumbnail').map((file: any) => {
              const fileId = extractGoogleDriveFileId(file.url);
              const srcUrl = fileId ? getProxyUrl(fileId, 'image') : file.url;
              return {
                src: srcUrl,
                originalUrl: file.url,
                fileId: fileId,
                directDownloadUrl: fileId ? getDirectDownloadUrl(fileId) : null,
                alt: file.name,
                name: file.name,
                liked: false
              };
            }),
            audio: responseFiles.filter((file: any) => file && file.type === 'music').map((file: any) => {
              const fileId = extractGoogleDriveFileId(file.url);
              const srcUrl = fileId ? getProxyUrl(fileId, 'audio') : file.url;
              return {
                src: srcUrl,
                originalUrl: file.url,
                fileId: fileId,
                directDownloadUrl: fileId ? getDirectDownloadUrl(fileId) : null,
                name: file.name,
                liked: false
              };
            }),
            videos: responseFiles.filter((file: any) => file && file.type === 'visual').map((file: any) => {
              const fileId = extractGoogleDriveFileId(file.url);
              const srcUrl = fileId ? getProxyUrl(fileId, 'video') : file.url;
              return {
                src: srcUrl,
                originalUrl: file.url,
                fileId: fileId,
                directDownloadUrl: fileId ? getDirectDownloadUrl(fileId) : null,
                name: file.name,
                liked: false
              };
            })
          };
          
          console.log("Generated media object:", {
            images: newGeneratedMedia.images.length,
            audio: newGeneratedMedia.audio.length,
            videos: newGeneratedMedia.videos.length
          });

          // Set the media data
          setGeneratedMedia(newGeneratedMedia);
          setMediaGenerated(true);

          // Create a promise for each media asset to load
          const loadPromises = [
            ...newGeneratedMedia.images.map((img, index, array) => new Promise((resolve, reject) => {
              const image = new Image();
              image.onload = () => {
                const progress = 50 + ((index + 1) / array.length) * 16.67; // 16.67 is roughly 50/3 to split remaining 50% among 3 types
                setLoadingProgress(progress);
                resolve(true);
              };
              image.onerror = reject;
              image.src = img.src;
            })),
            ...newGeneratedMedia.audio.map((audio, index, array) => new Promise((resolve) => {
              const audioEl = new Audio();
              audioEl.onloadeddata = () => {
                const progress = 66.67 + ((index + 1) / array.length) * 16.67;
                setLoadingProgress(progress);
                resolve(true);
              };
              audioEl.onerror = () => resolve(false);
              audioEl.src = audio.src;
            })),
            ...newGeneratedMedia.videos.map((video, index, array) => new Promise((resolve) => {
              const videoEl = document.createElement('video');
              videoEl.onloadeddata = () => {
                const progress = 83.34 + ((index + 1) / array.length) * 16.66;
                setLoadingProgress(progress);
                resolve(true);
              };
              videoEl.onerror = () => resolve(false);
              videoEl.src = video.src;
            }))
          ];

          await Promise.allSettled(loadPromises);
          setLoadingProgress(100)

        } catch (mediaError) {
          console.error('Media processing error:', mediaError);
          alert('Error processing media assets. Please try again.');
        } finally {
          setTimeout(() => {
            setIsGeneratingMedia(false);
            setLoadingProgress(0);
          }, 500); // Small delay to show 100% completion
        }
      }
    } catch (error) {
      console.error('Error processing script:', error);
      alert('Error processing script. Please try again.');
      setIsGeneratingMedia(false);
      setLoadingProgress(0);
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

  const handleApproveAssets = async () => {
    if (!generatedMedia || !script) {
      alert('No media assets or script to approve');
      return;
    }

    setIsApprovingAssets(true);
    try {
      // Format the media data into a single array
      const allImages = [
        ...(generatedMedia.images?.map((img: any) => ({ ...img, type: 'image', status: img.status || 'approved' })) || []),
        ...(localImages.map((img: any) => ({ ...img, type: 'image', status: 'approved' })) || [])
      ];
      const allAudio = [
        ...(generatedMedia.audio?.map((audio: any) => ({ ...audio, type: 'music', status: audio.status || 'approved' })) || []),
        ...(localAudio.map((audio: any, index: number) => ({
          ...audio,
          type: 'music',
          url: audio.src.split(',')[1] || audio.src,
          id: index + 1,
          totalItems: localAudio.length,
          name: audio.name,
          mimeType: audio.mimeType
        })) || []),
      ];
      const allVideos = [
        ...(generatedMedia.videos?.map((video: any) => ({ ...video, type: 'visual', status: video.status || 'approved' })) || []),
        ...(localVideos.map((video: any, index: number) => ({
          ...video,
          type: 'visual',
          url: video.src.split(',')[1] || video.src,
          id: index + 1,
          totalItems: localVideos.length,
          name: video.name,
          mimeType: video.mimeType
        })) || [])
      ];
      const allThumbnails = [
        ...(generatedMedia.thumbnails?.map((thumb: any) => ({ ...thumb, type: 'thumbnail', status: thumb.status || 'approved' })) || []),
        ...(localThumbnails.map((thumb: any) => ({ ...thumb, type: 'thumbnail', status: 'approved' })) || [])
      ];
      const allMedia = [...allImages, ...allAudio, ...allVideos, ...allThumbnails];
      const totalItems = allMedia.length;

      // Build Uploaded_media array from all manually uploaded media
      const uploadedMedia = [
        ...localImages.map((img: any, index: number) => ({
          ...img,
          type: 'image',
          url: img.src.split(',')[1] || img.src,
          id: index + 1,
          totalItems: localImages.length
        })),
        ...localAudio.map((audio: any, index: number) => ({
          ...audio,
          type: 'music',
          url: audio.src.split(',')[1] || audio.src,
          id: index + 1,
          totalItems: localAudio.length,
          name: audio.name,
          mimeType: audio.mimeType
        })),
        ...localVideos.map((video: any, index: number) => ({
          ...video,
          type: 'visual',
          url: video.src.split(',')[1] || video.src,
          id: index + 1,
          totalItems: localVideos.length,
          name: video.name,
          mimeType: video.mimeType
        })),
        ...localThumbnails.map((thumb: any, index: number) => ({
          ...thumb,
          type: 'thumbnail',
          url: thumb.src.split(',')[1] || thumb.src,
          id: index + 1,
          totalItems: localThumbnails.length
        })),
      ];

      // Build main media array for only generated media
      const generatedMediaArray = allMedia
        .filter((item: any) => !item.isBase64)
        .map((item: any, index: number) => ({
          id: index + 1,
          type: item.type,
          description: item.name || item.alt || `${item.type} content`,
          status: item.status,
          url: item.originalUrl || item.src,
          totalItems: allMedia.length
        }));

      // Transform the media array into the expected format
      const payload = {
        content: script,
        media: generatedMediaArray,
        Uploaded_media: uploadedMedia,
        responseId,
        timestamp: responseTimestamp,
        status: 'approved',
        topic: formData.topic,
        tone: formData.tone,
        genre: formData.genre
      };

      // Log the final payload for verification
      console.log('Final payload structure:', JSON.stringify(payload, null, 2));

      console.log('Full payload being sent:', JSON.stringify(payload, null, 2));

      const response = await fetch('/api/approve-assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Log the raw response
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response from server: ' + responseText);
      }

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to approve assets';
        const details = data.details ? `: ${JSON.stringify(data.details)}` : '';
        throw new Error(errorMessage + details);
      }

      console.log('Assets approved successfully:', data);
      router.push('/success');
    } catch (error) {
      console.error('Error approving assets:', error);
      alert(`Error approving assets: ${error.message}`);
    } finally {
      setIsApprovingAssets(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
      {mediaGenerated ? (
        <AssetSection 
          generatedMedia={generatedMedia}
          regeneratingAsset={regeneratingAsset}
          isApprovingAssets={isApprovingAssets}
          showSuccessMessage={showSuccessMessage}
          mediaRefs={mediaRefs}
          handleRegenerateMedia={handleRegenerateMedia}
          handleMediaPlay={handleMediaPlay}
          handleApproveAssets={handleApproveAssets}
          setMediaGenerated={setMediaGenerated}
          localImages={localImages}
          setLocalImages={setLocalImages}
          localAudio={localAudio}
          setLocalAudio={setLocalAudio}
          localVideos={localVideos}
          setLocalVideos={setLocalVideos}
          localThumbnails={localThumbnails}
          setLocalThumbnails={setLocalThumbnails}
        />
      ) : !hasScript ? (
        <TopicSection 
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      ) : (
        <ScriptSection 
          formData={formData}
          script={script}
          editedScript={editedScript}
          setEditedScript={setEditedScript}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          statusMessage={statusMessage}
          videoUrl={videoUrl}
          feedback={feedback}
          setFeedback={setFeedback}
          isProcessing={isProcessing}
          isGeneratingMedia={isGeneratingMedia}
          loadingProgress={loadingProgress}
          handleSaveEdit={handleSaveEdit}
          handleDownloadScript={handleDownloadScript}
          handleApproveOrRefineScript={handleApproveOrRefineScript}
          setHasScript={setHasScript}
          setScript={setScript}
          setVideoUrl={setVideoUrl}
          setVideoApproval={setVideoApproval}
          setMediaGenerated={setMediaGenerated}
        />
      )}
    </main>
  );
}