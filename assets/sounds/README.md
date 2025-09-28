# Sound Files

This directory contains sound effects for the SuperMind Trainer application.

## Required Files

- `correct.mp3` - Sound played when user gives correct answer
- `wrong.mp3` - Sound played when user gives wrong answer

## File Requirements

- Format: MP3
- Duration: 1-3 seconds
- Volume: Moderate (not too loud)
- Quality: 44.1kHz, 128kbps or higher

## Adding Sound Files

1. Place your MP3 files in this directory
2. Name them exactly as specified above
3. Ensure they are properly encoded MP3 files
4. Test the sounds in the application

## Alternative Formats

If you prefer other formats, you can modify the `playSound` function in `utils.js` to support:
- WAV files
- OGG files
- Web Audio API generated sounds

## No Sound Mode

The application gracefully handles missing sound files by:
- Logging a warning to the console
- Continuing normal operation
- Not breaking the user experience

## Creating Your Own Sounds

You can create simple sound effects using:
- Online sound generators
- Audio editing software
- Text-to-speech with audio export
- Free sound libraries (with proper attribution)

## License

Ensure any sound files you add are properly licensed for use in your application.
