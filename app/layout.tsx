import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import React from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'YouTube Agent',
  description: 'AI-powered YouTube script generator',
}

function YouTubeIcon() { return (<svg viewBox="0 0 256 180" width="60" height="60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M250.346 28.075A32.18 32.18 0 0 0 227.69 5.418C207.824 0 127.87 0 127.87 0S47.912.164 28.046 5.582A32.18 32.18 0 0 0 5.39 28.24c-6.009 35.298-8.34 89.084.165 122.97a32.18 32.18 0 0 0 22.656 22.657c19.866 5.418 99.822 5.418 99.822 5.418s79.955 0 99.82-5.418a32.18 32.18 0 0 0 22.657-22.657c6.338-35.348 8.291-89.1-.164-123.134Z" fill="red"/><path fill="#FFF" d="m102.421 128.06 66.328-38.418-66.328-38.418z"/></svg>) }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-gray-100`}>
        <header className="bg-gray-800 shadow-md p-2 flex items-center justify-center">
          <YouTubeIcon />
          <div className="ml-3">
            <h1 className="text-2xl font-bold text-red-500">Script Studio</h1>
            <p className="text-sm text-gray-400">YouTube Content Creator</p>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
} 