# AI Video Editor Development Plan

## Phase 1: Core Infrastructure & File Management

### Backend - File Upload & Storage System

- [ ] Create MediaAsset model with fields: id, filename, originalName, type, size, duration, dimensions, thumbnailPath, userId, projectId, createdAt
- [ ] Build MediaController with upload endpoint `/api/media/upload`
- [ ] Add file validation (MP4, WebM for videos; PNG, JPG for images)
- [ ] Implement file storage in `/uploads` directory with organized folder structure
- [ ] Use `multer` for handling multipart file uploads
- [ ] Use `ffprobe` to extract video metadata (duration, resolution, fps)
- [ ] Generate video thumbnails using `ffmpeg` (multiple frames for timeline scrubbing)
- [ ] Create MediaService for database operations and file processing
- [ ] Add streaming endpoint `/api/media/[id]/stream` with HTTP range support for video seeking

### Frontend - Asset Management UI

- [ ] Install and configure `react-dropzone` for file uploads
- [ ] Build AssetsSidebar with drag-and-drop upload zone
- [ ] Add file type filtering (video, image, audio tabs)
- [ ] Implement upload progress indicator
- [ ] Create asset thumbnail grid with file info (name, size, duration)
- [ ] Add asset selection state management

### Database Schema Updates

- [ ] Add MediaAsset collection with proper indexes
- [ ] Update VideoProject model to reference media assets
- [ ] Create relationship between projects and their media assets

## Phase 2: Video Player & Preview System

### Backend - Video Streaming

- [ ] Implement HTTP range request handling for video streaming
- [ ] Add video format conversion using `ffmpeg` if needed
- [ ] Create preview endpoint that serves optimized video for timeline
- [ ] Add video frame extraction for timeline thumbnails

### Frontend - Video Player

- [ ] Install `video.js` for robust video playback
- [ ] Build VideoPreview component with custom controls
- [ ] Implement play/pause/seek functionality
- [ ] Add time display and progress tracking
- [ ] Sync video player with timeline cursor position
- [ ] Handle video loading states and errors

## Phase 3: Timeline Infrastructure ✅

### Timeline Requirements Analysis - COMPLETED

- [x] **Created comprehensive timeline requirements document** (`TIMELINE_REQUIREMENTS.md`)
- [x] **Defined timeline store architecture and responsibilities**
- [x] **Specified four-layer track system (video, audio, image, subtitle)**
- [x] **Outlined clip management and transformation system**
- [x] **Designed multi-track playback synchronization**
- [x] **Planned backend API integration points**

### State Management Setup

- [ ] Install and configure `zustand` for timeline state (timeline already has zustand)
- [ ] Create timeline store with state: tracks, clips, currentTime, isPlaying, zoom, selectedClip
- [ ] Define Timeline data structures: Track, Clip, TimelineSettings
- [ ] Implement actions: addClip, updateClip, deleteClip, moveClip, setCurrentTime, play/pause

### Timeline Data Models

- [ ] Create TimelineClip interface: id, assetId, trackId, startTime, duration, trimStart, trimEnd
- [ ] Create TimelineTrack interface: id, type (video/audio/image/subtitle), clips[], muted, volume
- [ ] Update VideoProject to store timeline configuration

### Backend - Timeline Persistence

- [ ] Create TimelineController for saving/loading timeline data
- [ ] Add endpoints: GET/PUT `/api/projects/[id]/timeline`
- [ ] Implement timeline validation and conflict resolution
- [ ] Auto-save timeline changes with debouncing

## Phase 4: Canvas-Based Timeline UI

### Timeline Canvas Implementation

- [ ] Install `konva.js` and `react-konva` for canvas rendering
- [ ] Build Timeline component with time ruler and track lanes
- [ ] Implement drag-and-drop from assets to timeline
- [ ] Create draggable clip rectangles with resize handles
- [ ] Add timeline zoom and pan functionality
- [ ] Implement snap-to-grid for precise positioning

### Timeline Interactions

- [ ] Add clip selection with visual feedback
- [ ] Implement clip trimming (drag handles to adjust start/end)
- [ ] Add clip splitting at playhead position
- [ ] Enable clip moving between tracks
- [ ] Add multi-select for batch operations
- [ ] Implement playhead dragging for seeking

### Visual Timeline Features

- [ ] Display video thumbnails on timeline clips
- [ ] Add audio waveform visualization using `wavesurfer.js`
- [ ] Show clip names and duration overlays
- [ ] Add track headers with mute/solo controls
- [ ] Implement timeline grid and time markers

## Phase 5: Core Editing Operations

### Trim Functionality

- [ ] Add trim handles to timeline clips
- [ ] Update clip trimStart/trimEnd without moving the clip
- [ ] Sync trim changes with video player preview
- [ ] Validate trim boundaries (can't trim beyond original duration)

### Split/Cut Operations

- [ ] Add split functionality at playhead position
- [ ] Create two separate clips from one at split point
- [ ] Update database with new clip data
- [ ] Handle split for both video and audio tracks

### Join/Merge Operations

- [ ] Detect adjacent clips that can be joined
- [ ] Implement join operation for consecutive clips
- [ ] Validate that clips are from same source asset
- [ ] Update timeline state after join operations

### Multi-Track Support

- [ ] Allow multiple video and audio tracks
- [ ] Implement track adding/removing functionality
- [ ] Add track reordering (priority for layering)
- [ ] Handle audio mixing for multiple tracks

## Phase 6: Real-Time Playback System

### Playback Synchronization

- [ ] Sync video player with timeline position
- [ ] Handle playback across multiple clips and tracks
- [ ] Implement frame-accurate seeking
- [ ] Add playback speed controls (0.5x, 1x, 2x)

### Audio-Video Sync

- [ ] Ensure audio and video tracks stay synchronized
- [ ] Handle gaps between clips during playback
- [ ] Implement audio mixing for overlapping tracks
- [ ] Add volume controls per track

### Performance Optimization

- [ ] Implement clip preloading for smooth playback
- [ ] Add frame buffering for large video files
- [ ] Optimize timeline rendering for many clips
- [ ] Use requestAnimationFrame for smooth timeline updates

## Phase 7: Subtitle System

### Subtitle Data Model

- [ ] Create Subtitle interface: id, text, startTime, endTime, trackId, styling
- [ ] Add subtitle track type to timeline system
- [ ] Implement subtitle positioning and styling options

### Subtitle Editor UI

- [ ] Build subtitle editor in properties panel
- [ ] Add text input with time synchronization
- [ ] Implement subtitle timeline visualization
- [ ] Add styling controls (font, size, color, position)

### Subtitle Import/Export

- [ ] Support SRT file import/export
- [ ] Support VTT file format
- [ ] Add subtitle validation and timing checks
- [ ] Sync subtitles with video preview overlay

## Phase 8: Export System

### Video Export Backend

- [ ] Install and configure `ffmpeg` for video processing
- [ ] Create ExportController with POST `/api/projects/[id]/export`
- [ ] Implement timeline compilation to ffmpeg command
- [ ] Handle video concatenation, trimming, and track mixing
- [ ] Add export progress tracking with WebSocket or polling
- [ ] Support multiple output formats (MP4, WebM)

### Export UI

- [ ] Build export dialog with format/quality options
- [ ] Add export progress indicator
- [ ] Implement export history and download links
- [ ] Add export presets (1080p, 720p, etc.)

## Phase 9: AI Features Integration

### Background Noise Removal

- [ ] Integrate with ElevenLabs Voice Isolator API or similar
- [ ] Extract audio from video using ffmpeg
- [ ] Send audio to AI service for noise removal
- [ ] Replace original audio track with cleaned version
- [ ] Add progress tracking for AI processing

### Automatic Subtitle Generation

- [ ] Integrate with OpenAI Whisper API or AssemblyAI
- [ ] Extract audio and send for transcription
- [ ] Parse response into subtitle format with timestamps
- [ ] Add subtitle editing capabilities post-generation
- [ ] Support multiple languages

### AI Features UI

- [ ] Add AI buttons in properties panel
- [ ] Show processing progress for AI operations
- [ ] Handle API errors and retry logic
- [ ] Add preview before applying AI changes

## Phase 10: Polish & Optimization

### Performance Improvements

- [ ] Optimize timeline rendering for large projects
- [ ] Implement virtual scrolling for asset lists
- [ ] Add lazy loading for video thumbnails
- [ ] Optimize memory usage for long videos

### User Experience

- [ ] Add keyboard shortcuts (Space for play/pause, arrows for seeking)
- [ ] Implement undo/redo system
- [ ] Add project auto-save
- [ ] Create onboarding tutorial

### Error Handling

- [ ] Add comprehensive error boundaries
- [ ] Implement retry logic for failed operations
- [ ] Add user-friendly error messages
- [ ] Log errors for debugging

### Testing

- [ ] Write unit tests for timeline logic
- [ ] Add integration tests for API endpoints
- [ ] Test video upload and processing pipeline
- [ ] Performance test with large video files

## Libraries & Tools Summary

### Frontend Libraries

- `konva.js` + `react-konva` - Timeline canvas rendering
- `zustand` - Global state management
- `video.js` - Video player
- `react-dropzone` - File uploads
- `wavesurfer.js` - Audio waveform visualization
- `@tanstack/react-query` - Server state management

### Backend Libraries

- `multer` - File upload handling
- `ffmpeg` + `ffprobe` - Video processing and metadata
- `sharp` - Image processing for thumbnails

### External APIs

- ElevenLabs Voice Isolator - Background noise removal
- OpenAI Whisper or AssemblyAI - Subtitle generation

### Development Tools

- `jest` - Unit testing
- TypeScript - Type safety
- ESLint - Code quality
