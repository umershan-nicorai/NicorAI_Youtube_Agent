import React from 'react';
import ReactMarkdown from 'react-markdown';

interface FormData {
  topic: string
  tone: 'Professional' | 'Casual' | 'Funny'
  genre: 'Educational' | 'Entertainment' | 'Tutorial'
}

interface ScriptSectionProps {
  formData: FormData;
  script: string;
  editedScript: string;
  setEditedScript: React.Dispatch<React.SetStateAction<string>>;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  statusMessage: string;
  videoUrl: string | null;
  feedback: string;
  setFeedback: React.Dispatch<React.SetStateAction<string>>;
  isProcessing: boolean;
  isGeneratingMedia: boolean;
  loadingProgress: number;
  handleSaveEdit: () => void;
  handleDownloadScript: () => void;
  handleApproveOrRefineScript: () => Promise<void>;
  setHasScript: React.Dispatch<React.SetStateAction<boolean>>;
  setScript: React.Dispatch<React.SetStateAction<string>>;
  setVideoUrl: React.Dispatch<React.SetStateAction<string | null>>;
  setVideoApproval: React.Dispatch<React.SetStateAction<'approved' | 'rejected' | null>>;
  setMediaGenerated: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ScriptSection({
  formData,
  script,
  editedScript,
  setEditedScript,
  isEditing,
  setIsEditing,
  statusMessage,
  videoUrl,
  feedback,
  setFeedback,
  isProcessing,
  isGeneratingMedia,
  loadingProgress,
  handleSaveEdit,
  handleDownloadScript,
  handleApproveOrRefineScript,
  setHasScript,
  setScript,
  setVideoUrl,
  setVideoApproval,
  setMediaGenerated
}: ScriptSectionProps) {
  
  if (isGeneratingMedia) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] w-full max-w-2xl bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700 text-white">
        <h2 className="text-2xl font-bold mb-6">Creating Your Media</h2>
        <p className="text-gray-400 mb-8">Analyzing your Script...</p>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
          <div className="bg-red-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
        </div>
        <p className="text-gray-400 text-sm">{Math.round(loadingProgress)}% complete</p>
      </div>
    );
  }

  return (
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
        {videoUrl && (
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
  );
} 