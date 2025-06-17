# YouTube Agent Frontend

A Next.js 14 application for generating and managing YouTube video scripts with AI assistance.

## Features

- Topic submission with tone and genre selection
- AI-generated script generation
- Script editing capabilities
- Media notes for video production
- Clean and responsive UI with Tailwind CSS

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app` - Next.js 14 app directory
  - `/api` - API routes for script generation and management
  - `page.tsx` - Main application page
  - `layout.tsx` - Root layout component
  - `globals.css` - Global styles and Tailwind imports

## API Endpoints

- `POST /api/submitTopic` - Submit a new topic for script generation
- `GET /api/getScript` - Retrieve a generated script
- `POST /api/approveScript` - Approve the final script

## Technologies Used

- Next.js 14
- React
- TypeScript
- Tailwind CSS 