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

