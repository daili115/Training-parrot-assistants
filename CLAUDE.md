# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React 19 + TypeScript PWA for training parrots to speak. The app uses Web Audio API for recording, audio effects processing, and real-time noise monitoring. All data is persisted locally in localStorage as Base64-encoded audio files.

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Core Data Flow

**App.tsx** is the main component that orchestrates:
- State management for phrases, training settings, history, badges, and photos
- Data persistence via `utils/storage.ts`
- Training session lifecycle via `TrainingEngine` component
- Gamification logic via `utils/gamification.ts`, `utils/trainingTracker.ts`, and `utils/badgeManager.ts`

### Key Components

**Recording Flow** (`components/Recorder.tsx`):
- Uses `MediaRecorder` API to capture audio from microphone
- Converts Blob URL → Base64 for localStorage persistence
- Applies 14 voice effects using Web Audio API's `playbackRate` and `preservesPitch`
- Supports tag-based categorization

**Training Engine** (`components/TrainingEngine.tsx`):
- Real-time noise monitoring via `AudioContext` and `AnalyserNode`
- Audio playback with configurable intervals and session duration
- Fade-in/fade-out effects using volume ramping
- Natural jitter for varied playback timing

**Gamification System**:
- `utils/gamification.ts` - Badge definitions and streak calculation
- `utils/trainingTracker.ts` - Training record management and streak rewards
- `utils/badgeManager.ts` - Singleton manager for awarding badges with notification system

### Data Types (`types.ts`)

- **Phrase**: Training phrase with audio (Base64), effect, mastery level, play count
- **TrainingSettings**: Loop interval, session duration, order mode, volume, fade settings
- **TrainingOrder**: SEQUENTIAL, RANDOM, WEAK_LINK, NEWEST
- **SessionStats**: Training session history with play count and duration
- **UserStreak**: Current/longest streak tracking
- **Badge**: Achievement system with unlock timestamps

### Storage Layer (`utils/storage.ts`)

All data stored in localStorage with versioned keys:
- `parrot_phrases_v3` - Training phrases with Base64 audio
- `parrot_settings_v3` - Training configuration
- `parrot_history` - Session statistics
- `parrot_badges` - Unlocked achievements
- `parrot_training_records` - Daily training records
- `parrot_user_streak` - Streak tracking
- `parrot_streak_rewards` - Reward claims
- `parrot_photos` - Parrot photo gallery

### Audio Processing (`utils/audio.ts`)

**Voice Effects** (14 types):
- Rate-based: parrot (1.25x), deep (0.85x), chipmunk (1.5x), monster (0.7x), etc.
- Configured via `playbackRate` and `preservesPitch` properties
- Applied dynamically during playback in `TrainingEngine` and `Recorder`

### UI Components

- **TrainingEngine**: Full-screen immersive training mode with noise monitoring
- **PhraseCard**: Individual phrase display with effect preview and mastery slider
- **BadgeModal**: Achievement display with unlock animations
- **TrainingTracker**: Detailed streak and statistics view
- **ParrotGallery**: Photo management for parrot progress tracking
- **Scheduler**: Daily training reminder slots

### Theme System (`context/ThemeContext.tsx`)

Simple React context for dark/light mode toggle, persisted in localStorage.

## Important Implementation Details

### Audio Persistence

Audio is stored as Base64 Data URLs in localStorage. This can cause storage limits (~5-10MB depending on browser). The app handles this gracefully but doesn't have automatic cleanup.

### Web Audio API Usage

- **Recording**: `MediaRecorder` + `AudioContext` for real-time volume monitoring
- **Playback**: `HTMLAudioElement` with `playbackRate` for effects
- **Noise Monitoring**: `AnalyserNode` with FFT size 256 during training sessions

### Training Modes

- **Sequential**: Play phrases in order
- **Random**: Shuffle phrase order
- **Weak Link**: Prioritize phrases with lower mastery scores
- **Newest**: Play most recently added phrases first

### Streak Calculation

Streaks are calculated based on consecutive days with training records. The system checks if the last training was today or yesterday to maintain streak continuity.

## Development Notes

- No test framework configured
- No linting/formatting setup
- TypeScript strict mode is not explicitly configured
- Vite is used with `@vitejs/plugin-react` and `vite-plugin-pwa`
- Google Gemini API integration is available but requires `.env.local` with `GEMINI_API_KEY`

## Component Structure

```
components/
├── AICoach.tsx           # AI coaching feature (Gemini integration)
├── BadgeDisplay.tsx      # Badge visualization
├── BadgeModal.tsx        # Achievement modal
├── ErrorBoundary.tsx     # React error boundary
├── HistoryLog.tsx        # Training history display
├── LoadingSpinner.tsx    # Loading states
├── NotificationManager.tsx # Toast notifications
├── ParrotCareTips.tsx    # Care guide modal
├── ParrotGallery.tsx     # Photo management
├── PhraseCard.tsx        # Individual phrase card
├── Recorder.tsx          # Audio recording interface
├── Scheduler.tsx         # Training reminders
├── ToggleTheme.tsx       # Theme switcher
├── Tooltip.tsx           # Tooltip component
├── TrainingEngine.tsx    # Main training session UI
└── TrainingTracker.tsx   # Streak/statistics modal
```

## Utility Modules

```
utils/
├── audio.ts              # Audio effects and processing
├── badgeManager.ts       # Singleton badge award manager
├── gamification.ts       # Badge definitions and streak logic
├── storage.ts            # localStorage persistence
└── trainingTracker.ts    # Training record management
```

## Key Dependencies

- `react@19.2.3` - UI framework
- `lucide-react@0.562.0` - Icon library
- `@google/genai@1.34.0` - Gemini API integration
- `vite@6.2.0` - Build tool
- `vite-plugin-pwa@1.2.0` - PWA support

## Environment Setup

Create `.env.local` for AI features:
```
GEMINI_API_KEY=your_api_key_here
```

Without the API key, most features work except the AI coaching component.
