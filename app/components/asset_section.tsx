import React, { RefObject, useEffect, useState } from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';

interface AssetSectionProps {
  generatedMedia: any;
  regeneratingAsset: { type: 'images' | 'audio' | 'videos', index: number } | null;
  isApprovingAssets: boolean;
  showSuccessMessage: boolean;
  mediaRefs: RefObject<(HTMLAudioElement | HTMLVideoElement)[]>;
  handleRegenerateMedia: (type: 'images' | 'audio' | 'videos', index: number) => Promise<void>;
  handleMediaPlay: (event: React.SyntheticEvent<HTMLAudioElement | HTMLVideoElement>) => void;
  handleApproveAssets: () => Promise<void>;
  setMediaGenerated: React.Dispatch<React.SetStateAction<boolean>>;
  localImages: any[];
  setLocalImages: React.Dispatch<React.SetStateAction<any[]>>;
  localAudio: any[];
  setLocalAudio: React.Dispatch<React.SetStateAction<any[]>>;
  localVideos: any[];
  setLocalVideos: React.Dispatch<React.SetStateAction<any[]>>;
  localThumbnails: any[];
  setLocalThumbnails: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function AssetSection({
  generatedMedia,
  regeneratingAsset,
  isApprovingAssets,
  showSuccessMessage,
  mediaRefs,
  handleRegenerateMedia,
  handleMediaPlay,
  handleApproveAssets,
  setMediaGenerated,
  localImages,
  setLocalImages,
  localAudio,
  setLocalAudio,
  localVideos,
  setLocalVideos,
  localThumbnails,
  setLocalThumbnails
}: AssetSectionProps) {
  // Debug log to check if thumbnails are present
  console.log('AssetSection generatedMedia:', generatedMedia);
  
  // Remove fallback state variables since we don't want automatic fallbacks
  
  // Remove the useEffect that was setting fallback flags
  
  // Keep these functions for error handling only, not for automatic fallbacks
  const getLocalAudioPath = (index: number) => {
    return '/dont-talk.mp3';
  };
  
  const getLocalVideoPath = (index: number) => {
    const localVideoFiles = [
      '/circle.mp4',
      '/spark.mp4',
      '/ScreenRecording.mp4'
    ];
    return localVideoFiles[index % localVideoFiles.length];
  };

  // Add delete handlers for each local asset type
  const handleDeleteLocalThumbnail = (index: number) => setLocalThumbnails(prev => prev.filter((_, i) => i !== index));
  const handleDeleteLocalImage = (index: number) => setLocalImages(prev => prev.filter((_, i) => i !== index));
  const handleDeleteLocalAudio = (index: number) => setLocalAudio(prev => prev.filter((_, i) => i !== index));
  const handleDeleteLocalVideo = (index: number) => setLocalVideos(prev => prev.filter((_, i) => i !== index));

  // Add delete handlers for each generated asset type
  const [deletedGeneratedThumbnails, setDeletedGeneratedThumbnails] = useState<Set<number>>(new Set());
  const [deletedGeneratedImages, setDeletedGeneratedImages] = useState<Set<number>>(new Set());
  const [deletedGeneratedAudio, setDeletedGeneratedAudio] = useState<Set<number>>(new Set());
  const [deletedGeneratedVideos, setDeletedGeneratedVideos] = useState<Set<number>>(new Set());

  const handleDeleteGeneratedThumbnail = (index: number) => setDeletedGeneratedThumbnails(prev => new Set([...prev, index]));
  const handleDeleteGeneratedImage = (index: number) => setDeletedGeneratedImages(prev => new Set([...prev, index]));
  const handleDeleteGeneratedAudio = (index: number) => setDeletedGeneratedAudio(prev => new Set([...prev, index]));
  const handleDeleteGeneratedVideo = (index: number) => setDeletedGeneratedVideos(prev => new Set([...prev, index]));

  // Helper for file upload
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnails' | 'images' | 'audio' | 'videos') => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    let url = URL.createObjectURL(file);
    if (type === 'thumbnails' || type === 'images') {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
      }
      const newItem = { src: url, alt: file.name, date: new Date().toLocaleString() };
      if (type === 'thumbnails') setLocalThumbnails(prev => [newItem, ...prev]);
      else setLocalImages(prev => [newItem, ...prev]);
    } else if (type === 'audio') {
      if (!file.type.startsWith('audio/')) {
        alert('Please upload an audio file.');
        return;
      }
      const newItem = { src: url, name: file.name, date: new Date().toLocaleString() };
      setLocalAudio(prev => [newItem, ...prev]);
    } else if (type === 'videos') {
      if (!file.type.startsWith('video/')) {
        alert('Please upload a video file.');
        return;
      }
      const newItem = { src: url, name: file.name, date: new Date().toLocaleString() };
      setLocalVideos(prev => [newItem, ...prev]);
    }
  };

  // Popup state for regeneration feedback
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackValue, setFeedbackValue] = useState('');
  const [regenTarget, setRegenTarget] = useState<{ type: 'thumbnails' | 'images' | 'audio' | 'videos'; index: number } | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Open feedback modal for regeneration
  const openFeedbackModal = (type: 'thumbnails' | 'images' | 'audio' | 'videos', index: number) => {
    setRegenTarget({ type, index });
    setFeedbackValue('');
    setShowFeedbackModal(true);
    setIsRegenerating(false);
  };

  // Handle feedback submit
  const handleFeedbackSubmit = async () => {
    if (regenTarget && !isRegenerating) {
      setIsRegenerating(true);
      await handleRegenerateMedia(regenTarget.type as any, regenTarget.index, feedbackValue); // Pass feedback to handler
      setShowFeedbackModal(false);
      setRegenTarget(null);
      setFeedbackValue('');
      setIsRegenerating(false);
    }
  };

  return (
    <div className="w-full max-w-7xl flex flex-col items-center justify-center p-4">
      {/* Success Message Overlay */}
      {showSuccessMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900">
          <div className="w-full max-w-md p-8 flex flex-col items-center">
            {/* Animated checkmark icon */}
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 bg-red-500/10 rounded-full animate-circle"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-red-500" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-draw-checkmark"
                  />
                </svg>
              </div>
            </div>
            
            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-2">Assets Approved!</h2>
            
            {/* Status message */}
            <p className="text-gray-400">Your assets have been approved successfully</p>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700 w-full">
        <button
          onClick={() => setMediaGenerated(false)} // Go back to script view
          className="mb-6 text-gray-400 hover:text-white flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Generate New Media
        </button>
        <h2 className="text-2xl font-bold text-white mb-4">Assets from the script</h2>
        
        {/* Thumbnails section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Thumbnails <span className="text-gray-400 text-sm">{(localThumbnails.length + (generatedMedia.thumbnails?.length || 0)) > 0 ? `(${localThumbnails.length + (generatedMedia.thumbnails?.length || 0)})` : ''}</span></h3>
            <label className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700 transition-colors duration-200 font-semibold text-sm gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Upload
              <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, 'thumbnails')} />
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localThumbnails.map((thumbnail, index) => (
              <div key={index} className="bg-gray-700 rounded-lg overflow-hidden shadow-md relative">
                <button onClick={() => handleDeleteLocalThumbnail(index)} className="absolute top-2 right-2 bg-red-700 hover:bg-red-800 text-white rounded-full p-1 z-10" title="Delete thumbnail">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <img src={thumbnail.src} alt={thumbnail.alt} className="w-full h-48 object-cover" crossOrigin="anonymous" />
                <div className="p-4">
                  <p className="text-white font-semibold flex items-center gap-2">{thumbnail.alt}</p>
                  <p className="text-gray-400 text-sm mt-1">{thumbnail.date}</p>
                </div>
              </div>
            ))}
            {generatedMedia.thumbnails && generatedMedia.thumbnails.map((thumbnail: any, index: number) => (
              !deletedGeneratedThumbnails.has(index) && (
                <div key={index + localThumbnails.length} className="bg-gray-700 rounded-lg overflow-hidden shadow-md relative">
                  <button onClick={() => handleDeleteGeneratedThumbnail(index)} className="absolute top-2 right-2 bg-red-700 hover:bg-red-800 text-white rounded-full p-1 z-10" title="Delete thumbnail">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <img src={thumbnail.src} alt={thumbnail.alt} className="w-full h-48 object-cover" crossOrigin="anonymous" />
                  <div className="p-4">
                    <p className="text-white font-semibold flex items-center gap-2">
                      {thumbnail.alt}
                      <button
                        onClick={() => openFeedbackModal('thumbnails', index)}
                        disabled={regeneratingAsset && regeneratingAsset.type === 'thumbnails' && regeneratingAsset.index === index}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600/10 hover:bg-red-600 transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed group"
                        title="Regenerate thumbnail"
                      >
                        <svg 
                          className={`w-4 h-4 text-red-500 group-hover:text-white transition-transform duration-300 ${
                            regeneratingAsset && regeneratingAsset.type === 'thumbnails' && regeneratingAsset.index === index ? 'animate-spin' : ''
                          }`}
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                          />
                        </svg>
                      </button>
                    </p>
                    <p className="text-gray-400 text-sm mt-1">{thumbnail.date}</p>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Images section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Images <span className="text-gray-400 text-sm">{(localImages.length + (generatedMedia.images?.length || 0)) > 0 ? `(${localImages.length + (generatedMedia.images?.length || 0)})` : ''}</span></h3>
            <label className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700 transition-colors duration-200 font-semibold text-sm gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Upload
              <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, 'images')} />
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localImages.map((image, index) => (
              <div key={index} className="bg-gray-700 rounded-lg overflow-hidden shadow-md relative">
                <button onClick={() => handleDeleteLocalImage(index)} className="absolute top-2 right-2 bg-red-700 hover:bg-red-800 text-white rounded-full p-1 z-10" title="Delete image">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <img src={image.src} alt={image.alt} className="w-full h-48 object-cover" crossOrigin="anonymous" />
                <div className="p-4">
                  <p className="text-white font-semibold flex items-center gap-2">{image.alt}</p>
                  <p className="text-gray-400 text-sm mt-1">{image.date}</p>
                </div>
              </div>
            ))}
            {generatedMedia.images && generatedMedia.images.map((image: any, index: number) => (
              !deletedGeneratedImages.has(index) && (
                <div key={index + localImages.length} className="bg-gray-700 rounded-lg overflow-hidden shadow-md relative">
                  <button onClick={() => handleDeleteGeneratedImage(index)} className="absolute top-2 right-2 bg-red-700 hover:bg-red-800 text-white rounded-full p-1 z-10" title="Delete image">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <img src={image.src} alt={image.alt} className="w-full h-48 object-cover" crossOrigin="anonymous" />
                  <div className="p-4">
                    <p className="text-white font-semibold flex items-center gap-2">
                      {image.alt}
                      <button
                        onClick={() => openFeedbackModal('images', index)}
                        disabled={regeneratingAsset && regeneratingAsset.type === 'images' && regeneratingAsset.index === index}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600/10 hover:bg-red-600 transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed group"
                        title="Regenerate image"
                      >
                        <svg 
                          className={`w-4 h-4 text-red-500 group-hover:text-white transition-transform duration-300 ${
                            regeneratingAsset && regeneratingAsset.type === 'images' && regeneratingAsset.index === index ? 'animate-spin' : ''
                          }`}
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                          />
                        </svg>
                      </button>
                    </p>
                    <p className="text-gray-400 text-sm mt-1">{image.date}</p>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Audio section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Generated Audio <span className="text-gray-400 text-sm">{(localAudio.length + (generatedMedia.audio?.length || 0)) > 0 ? `(${localAudio.length + (generatedMedia.audio?.length || 0)})` : ''}</span></h3>
            <label className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700 transition-colors duration-200 font-semibold text-sm gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Upload
              <input type="file" accept="audio/*" className="hidden" onChange={e => handleUpload(e, 'audio')} />
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localAudio.map((audio, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4 flex flex-col items-start relative">
                <button onClick={() => handleDeleteLocalAudio(index)} className="absolute top-2 right-2 bg-red-700 hover:bg-red-800 text-white rounded-full p-1 z-10" title="Delete audio">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <audio controls src={audio.src} className="w-full mb-2" crossOrigin="anonymous" preload="auto"></audio>
                <div>
                  <p className="text-white font-semibold flex items-center gap-2">{audio.name}</p>
                  <p className="text-gray-400 text-sm mt-1">{audio.date}</p>
                </div>
              </div>
            ))}
            {generatedMedia.audio && generatedMedia.audio.map((audio: any, index: number) => (
              !deletedGeneratedAudio.has(index) && (
                <div key={index + localAudio.length} className="bg-gray-700 rounded-lg p-4 flex flex-col items-start relative">
                  <button onClick={() => handleDeleteGeneratedAudio(index)} className="absolute top-2 right-2 bg-red-700 hover:bg-red-800 text-white rounded-full p-1 z-10" title="Delete audio">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {/* Fallback direct link for audio that might not play */}
                  {audio.originalUrl && (
                    <div className="w-full mb-2 text-xs text-gray-400">
                      <a href={audio.originalUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 underline">
                        Direct link to audio (if player doesn't work)
                      </a>
                    </div>
                  )}
                  <audio
                    controls
                    src={audio.fileId ? `/api/audio-proxy?fileId=${audio.fileId}` : (audio.directDownloadUrl || audio.src)}
                    className="w-full mb-2"
                    crossOrigin="anonymous"
                    preload="auto"
                    ref={el => {
                      if (el) {
                        // Only add if not already in the array
                        if (!mediaRefs.current.includes(el)) {
                          mediaRefs.current.push(el);
                          // Set the source directly using a different approach
                          if (audio.fileId) {
                            el.src = `/api/audio-proxy?fileId=${audio.fileId}`;
                          } else if (audio.directDownloadUrl) {
                            el.src = audio.directDownloadUrl;
                          } else if (audio.src) {
                            el.src = audio.src;
                          }
                        }
                      }
                    }}
                    onPlay={handleMediaPlay}
                    onError={(e) => {
                      // Log error but don't use fallback
                      console.error('Error loading audio:', e);
                      const audioElement = e.currentTarget;
                      // Show error message instead of using fallback
                      const errorContainer = audioElement.parentElement;
                      if (errorContainer) {
                        const errorMessage = document.createElement('div');
                        errorMessage.className = 'text-red-500 text-sm mt-2';
                        errorMessage.textContent = 'Error loading audio from backend. Please try regenerating.';
                        // Remove any existing error messages
                        const existingError = errorContainer.querySelector('.text-red-500');
                        if (existingError) {
                          errorContainer.removeChild(existingError);
                        }
                        errorContainer.appendChild(errorMessage);
                      }
                    }}
                  ></audio>
                  <div>
                    <p className="text-white font-semibold flex items-center gap-2">
                      {audio.name}
                      <button
                        onClick={() => openFeedbackModal('audio', index)}
                        disabled={regeneratingAsset && regeneratingAsset.type === 'audio' && regeneratingAsset.index === index}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600/10 hover:bg-red-600 transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed group"
                        title="Regenerate audio"
                      >
                        <svg 
                          className={`w-4 h-4 text-red-500 group-hover:text-white transition-transform duration-300 ${
                            regeneratingAsset && regeneratingAsset.type === 'audio' && regeneratingAsset.index === index ? 'animate-spin' : ''
                          }`}
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                          />
                        </svg>
                      </button>
                    </p>
                    <p className="text-gray-400 text-sm mt-1">{audio.date}</p>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Videos section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Generated Videos <span className="text-gray-400 text-sm">{(localVideos.length + (generatedMedia.videos?.length || 0)) > 0 ? `(${localVideos.length + (generatedMedia.videos?.length || 0)})` : ''}</span></h3>
            <label className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700 transition-colors duration-200 font-semibold text-sm gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Upload
              <input type="file" accept="video/*" className="hidden" onChange={e => handleUpload(e, 'videos')} />
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localVideos.map((video, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4 relative">
                <button onClick={() => handleDeleteLocalVideo(index)} className="absolute top-2 right-2 bg-red-700 hover:bg-red-800 text-white rounded-full p-1 z-10" title="Delete video">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <video controls src={video.src} className="w-full rounded-md" crossOrigin="anonymous" preload="auto" playsInline></video>
                <div className="mt-2">
                  <p className="text-white font-semibold flex items-center gap-2">{video.name}</p>
                  <p className="text-gray-400 text-sm mt-1">{video.date}</p>
                </div>
              </div>
            ))}
            {generatedMedia.videos && generatedMedia.videos.map((video: any, index: number) => (
              !deletedGeneratedVideos.has(index) && (
                <div key={index + localVideos.length} className="bg-gray-700 rounded-lg p-4 relative">
                  <button onClick={() => handleDeleteGeneratedVideo(index)} className="absolute top-2 right-2 bg-red-700 hover:bg-red-800 text-white rounded-full p-1 z-10" title="Delete video">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {/* Fallback direct link for videos that might not play */}
                  {video.originalUrl && (
                    <div className="w-full mb-2 text-xs text-gray-400">
                      <a href={video.originalUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 underline">
                        Direct link to video (if player doesn't work)
                      </a>
                    </div>
                  )}
                  <video
                    controls
                    src={video.fileId ? `/api/video-proxy?fileId=${video.fileId}` : video.src}
                    className="w-full rounded-md"
                    crossOrigin="anonymous"
                    preload="auto"
                    playsInline
                    ref={el => {
                      if (el) {
                        // Only add if not already in the array
                        if (!mediaRefs.current.includes(el)) {
                          mediaRefs.current.push(el);
                          // Set the source directly using a different approach
                          if (video.fileId) {
                            el.src = `/api/video-proxy?fileId=${video.fileId}`;
                          } else if (video.directDownloadUrl) {
                            el.src = video.directDownloadUrl;
                          } else if (video.src) {
                            el.src = video.src;
                          }
                        }
                      }
                    }}
                    onPlay={handleMediaPlay}
                    onError={(e) => {
                      // Log error but don't use fallback
                      console.error('Error loading video:', e);
                      const videoElement = e.currentTarget;
                      // Show error message instead of using fallback
                      const errorContainer = videoElement.parentElement;
                      if (errorContainer) {
                        const errorMessage = document.createElement('div');
                        errorMessage.className = 'text-red-500 text-sm mt-2';
                        errorMessage.textContent = 'Error loading video from backend. Please try regenerating.';
                        // Remove any existing error messages
                        const existingError = errorContainer.querySelector('.text-red-500');
                        if (existingError) {
                          errorContainer.removeChild(existingError);
                        }
                        errorContainer.appendChild(errorMessage);
                      }
                    }}
                  ></video>
                  <div className="mt-2">
                    <p className="text-white font-semibold flex items-center gap-2">
                      {video.name}
                      <button
                        onClick={() => openFeedbackModal('videos', index)}
                        disabled={regeneratingAsset && regeneratingAsset.type === 'videos' && regeneratingAsset.index === index}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600/10 hover:bg-red-600 transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed group"
                        title="Regenerate video"
                      >
                        <svg 
                          className={`w-4 h-4 text-red-500 group-hover:text-white transition-transform duration-300 ${
                            regeneratingAsset && regeneratingAsset.type === 'videos' && regeneratingAsset.index === index ? 'animate-spin' : ''
                          }`}
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                          />
                        </svg>
                      </button>
                    </p>
                    <p className="text-gray-400 text-sm mt-1">{video.date}</p>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={handleApproveAssets}
            disabled={isApprovingAssets}
            className={`bg-green-600 text-white py-3 px-6 rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-semibold text-lg transition-colors duration-200 ${
              isApprovingAssets ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isApprovingAssets ? 'Approving...' : 'Approve Assets'}
          </button>
        </div>
      </div>

      {/* Feedback Modal for Regeneration */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700 w-full max-w-md flex flex-col items-center">
            <h2 className="text-xl font-bold text-white mb-4">Regenerate Media</h2>
            <label className="text-gray-300 mb-2 w-full text-left">Feedback or Suggestion</label>
            <textarea
              className="w-full h-24 rounded-md border border-gray-600 bg-gray-700 text-white shadow-sm focus:border-red-500 focus:ring-red-500 px-3 py-2 resize-y mb-4"
              value={feedbackValue}
              onChange={e => setFeedbackValue(e.target.value)}
              placeholder="Enter your feedback or suggestion to improve the regenerated media..."
              disabled={isRegenerating}
            />
            <div className="flex gap-4 w-full justify-end">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="bg-gray-600 text-white py-2 px-6 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 font-semibold transition-colors duration-200"
                disabled={isRegenerating}
              >
                Cancel
              </button>
              <button
                onClick={handleFeedbackSubmit}
                className="bg-red-600 text-white py-2 px-6 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold transition-colors duration-200 flex items-center justify-center"
                disabled={isRegenerating || feedbackValue.trim() === ''}
              >
                {isRegenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Regenerating...
                  </>
                ) : 'Regenerate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 