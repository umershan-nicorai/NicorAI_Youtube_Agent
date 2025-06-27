'use client';
import React from 'react';
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
      <div className="relative bg-gray-800/90 rounded-2xl shadow-2xl p-12 border border-gray-700 flex flex-col items-center max-w-xl w-full animate-fade-in">
        {/* Animated red checkmark */}
        <div className="mb-8">
          <svg className="w-24 h-24 text-red-500 animate-bounceIn" fill="none" stroke="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="22" stroke="#ef4444" strokeWidth="4" fill="#2d0707" opacity="0.2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M14 26l7 7 13-13" />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold mb-4 text-center text-red-400 drop-shadow-lg">Assets Approved!</h1>
        <p className="text-xl mb-8 text-gray-200 text-center font-medium">Your media assets have been <span className="text-red-400 font-bold">successfully approved</span> and uploaded.</p>
        <div className="bg-gray-700/80 rounded-lg p-6 mb-6 w-full text-center shadow-md">
          <p className="mb-3 text-lg text-gray-100 font-semibold">Your Google Drive Link:</p>
          <a
            href="#"
            className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-red-600 to-red-400 text-white font-bold text-lg shadow-lg hover:scale-105 hover:from-red-700 hover:to-red-500 transition-all duration-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            🎬 Click here to view your media (dummy link)
          </a>
        </div>
        <Link href="/" className="mt-2 text-base text-red-300 hover:text-red-400 underline font-semibold transition-colors duration-200">Back to Home</Link>
      </div>
      <style jsx>{`
        .animate-bounceIn {
          animation: bounceIn 1s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }
        @keyframes bounceIn {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          80% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 1.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
} 