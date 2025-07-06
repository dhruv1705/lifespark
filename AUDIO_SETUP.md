# Audio Setup Instructions

## 🎵 Adding Your Background Music

To complete the audio experience, please follow these steps:

### 1. Prepare Your Music File
- **Format**: MP3 (recommended)
- **Duration**: 5+ minutes (will loop automatically)
- **Style**: Ambient/relaxing music suitable for stretching
- **File name**: `stretch-background-music.mp3` (or any name you prefer)

### 2. Add the File to the Project
1. Place your MP3 file in: `/assets/audio/stretch-background-music.mp3`
2. Update the import in `HabitExecutionScreen.tsx` (line 155):

```typescript
// Replace this line:
// const musicFile = require('../../assets/audio/your-music-file.mp3');

// With your actual file:
const musicFile = require('../../assets/audio/stretch-background-music.mp3');

// Then uncomment this line in handleStartSession:
await audioManager.startSession(musicFile);
```

## 🗣️ Voice Commands Already Working

The text-to-speech system is ready and will provide:
- **Welcome messages**: "Welcome to your 5-minute morning stretch"
- **Exercise introductions**: "Let's start with neck rolls..."
- **Timing alerts**: "Ten more seconds", "Five more seconds"
- **Transitions**: "Great job on neck rolls! Now let's move to shoulder shrugs"
- **Completion celebration**: "Excellent work! You've completed your routine"

## 🎚️ Audio Controls

Users can now control:
- **Pre-session**: Toggle music and voice on/off
- **During session**: Quick mute buttons for music (🎵/🔇) and voice (🗣️/🤐)
- **Audio mixing**: Music automatically ducks when voice speaks

## Testing the Experience

1. **Without music**: Voice commands work immediately
2. **With music**: Add your MP3 file and update the code as shown above
3. **Complete experience**: Background music + voice guidance for professional stretching session

The framework is complete and ready for your audio file!