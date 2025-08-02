Build a Video Editor with AI Features

Create a web-based video editor where users can upload videos and images, perform basic
editing operations (trim, join, clip), and apply AI-powered features such as background noise
removal and subtitle generation using external APIs.

# Core Requirements:
1. Core Video Editor
- Allow users to:
    - Trim video and audio
    - Join multiple clips
    - Split/clip video timeline
- Must show video and audio as separate layers/tracks
- Upload and store videos (MP4, WebM) and images (PNG, JPG)
- Show real-time playback with any changes
- Let users add, edit, and display subtitles over the video

# AI-Powered Features
1. 🎙 Background Noise Removal
- Allow the user to remove background noise from uploaded video’s audio track using
some external API (like ElevenLabs Voice Isolator API or others)
- Replace the old audio with the cleaned one in the video
2. Subtitle Generation
- Generate subtitles from audio/video using some external APIs like OpenAI Whisper (via
OpenAI API), Gemini API, AssemblyAI, or Deepgram
- Extract audio from video → generate subtitles → allow editing → display over video

# Tech:
Framework: Next.js (with App Router and TypeScript)
Styling: TailwindCSS
Database : MongoDB (with native Nodejs driver and u don’t have to use mongoose)
Plus Points:
Respecting type-safety and use of generics if possible
Layered Architecture for backend (handler -> service -> repository)
High Cohesion, Low Coupling
Best React Practices
Unit Tests if possible (with Jest)


Note: Keep things simple. Don't overengineer. Don't add comments unless very very necessary.

