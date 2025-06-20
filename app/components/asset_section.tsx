import React, { RefObject, useEffect, useState } from 'react';

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
  setMediaGenerated
}: AssetSectionProps) {
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
        
        {/* Images section */}
        {generatedMedia.images && generatedMedia.images.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Images <span className="text-gray-400 text-sm">({generatedMedia.images.length})</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedMedia.images.map((image: any, index: number) => (
                <div key={index} className="bg-gray-700 rounded-lg overflow-hidden shadow-md">
                  <img src={image.src} alt={image.alt} className="w-full h-48 object-cover" crossOrigin="anonymous" />
                  <div className="p-4">
                    <p className="text-white font-semibold flex items-center gap-2">
                      {image.alt}
                      <button
                        onClick={() => handleRegenerateMedia('images', index)}
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
                        onClick={() => handleRegenerateMedia('audio', index)}
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
                        onClick={() => handleRegenerateMedia('videos', index)}
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
              ))}
            </div>
          </div>
        )}

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
    </div>
  );
} 