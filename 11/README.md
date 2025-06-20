# Audio Transcription and Analysis Tool

A lightweight console application that transcribes audio files, generates summaries, and extracts meaningful insights using OpenAI's Whisper and GPT models.

## Features

- **Audio Transcription**: Uses OpenAI's Whisper API to transcribe audio files with high accuracy
- **Text Summarization**: Generates concise summaries using GPT-4
- **Analytics Extraction**: Calculates word count, speaking speed (WPM), and identifies frequently mentioned topics
- **File Output**: Saves transcription, summary, and analytics to separate files
- **Console Display**: Shows summary and analytics in the terminal

## Requirements

- Python 3.7 or higher
- OpenAI API key
- Audio file in supported format (MP3, WAV, M4A, etc.)

## Installation

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install required dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up your OpenAI API key**
   
   You have two options:
   
   **Option A: Environment Variable (Recommended)**
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```
   
   Or create a `.env` file in the project directory:
   ```
   OPENAI_API_KEY=your-api-key-here
   ```
   
   **Option B: Command Line Parameter**
   Pass the API key directly when running the application (see usage examples below).

## Usage

### Basic Usage
```bash
python main.py audio.mp3
```

### With API Key Parameter
```bash
python main.py audio.mp3 --api-key sk-your-api-key-here
```

### Different Audio Formats
```bash
python main.py recording.wav
python main.py interview.m4a
python main.py podcast.mp3
```

## Output Files

The application creates three output files for each processed audio:

1. **Transcription File**: `transcription_<filename>_<timestamp>.md`
   - Complete text transcription of the audio
   - Includes metadata (source file, generation time)

2. **Summary File**: `summary_<filename>_<timestamp>.md`
   - Concise summary of the key points
   - Structured and easy to read

3. **Analytics File**: `analysis_<filename>_<timestamp>.json`
   - Word count
   - Speaking speed (words per minute)
   - Estimated duration
   - Top mentioned topics with frequency counts

## Example Output

### Console Output
```
🚀 Starting audio processing for: audio.mp3
============================================================
🎵 Transcribing audio file: audio.mp3
✅ Transcription completed successfully!
📝 Generating summary...
✅ Summary generated successfully!
📊 Calculating analytics...
✅ Analytics calculated successfully!
💾 Results saved:
   📄 Transcription: transcription_audio_20240115_143022.md
   📋 Summary: summary_audio_20240115_143022.md
   📊 Analytics: analysis_audio_20240115_143022.json

============================================================
📊 ANALYSIS RESULTS
============================================================

📋 SUMMARY:
----------------------------------------
The speaker discusses the importance of customer onboarding 
and outlines a comprehensive Q4 roadmap focusing on AI integration 
and user experience improvements...

📊 ANALYTICS:
----------------------------------------
{
  "word_count": 1280,
  "speaking_speed_wpm": 132,
  "estimated_duration_minutes": 9.7,
  "frequently_mentioned_topics": [
    { "topic": "Customer Onboarding", "mentions": 6 },
    { "topic": "Q4 Roadmap", "mentions": 4 },
    { "topic": "AI Integration", "mentions": 3 }
  ]
}

============================================================
✅ Processing completed successfully!
All results have been saved to separate files.
```

### Analytics JSON Structure
```json
{
  "word_count": 1280,
  "speaking_speed_wpm": 132,
  "estimated_duration_minutes": 9.7,
  "frequently_mentioned_topics": [
    { "topic": "Customer Onboarding", "mentions": 6 },
    { "topic": "Q4 Roadmap", "mentions": 4 },
    { "topic": "AI Integration", "mentions": 3 },
    { "topic": "User Experience", "mentions": 2 },
    { "topic": "Performance Metrics", "mentions": 2 }
  ]
}
```

## Supported Audio Formats

The application supports all audio formats supported by OpenAI's Whisper API:
- MP3
- MP4
- MPEG
- MPGA
- M4A
- WAV
- WEBM

## Error Handling

The application provides clear error messages for common issues:
- Missing API key
- Audio file not found
- Unsupported audio format
- Network connectivity issues
- API rate limits

## Troubleshooting

### Common Issues

1. **"OpenAI API key not found" Error**
   - Make sure you've set the `OPENAI_API_KEY` environment variable
   - Or pass the API key using the `--api-key` parameter

2. **"Audio file not found" Error**
   - Check that the file path is correct
   - Ensure the audio file exists in the specified location

3. **"Connection Error" or "Rate Limit" Errors**
   - Check your internet connection
   - Verify your OpenAI API key is valid and has sufficient credits
   - Wait a moment and try again if rate limited

4. **"Unsupported audio format" Error**
   - Convert your audio to one of the supported formats (MP3, WAV, M4A, etc.)

### Getting Help

If you encounter issues:
1. Check the error message for specific details
2. Verify your API key is valid
3. Ensure the audio file is in a supported format
4. Check your internet connection

## API Costs

This application uses OpenAI's paid APIs:
- **Whisper API**: $0.006 per minute of audio
- **GPT-4 API**: Variable pricing based on tokens used

Typical costs for a 10-minute audio file:
- Whisper transcription: ~$0.06
- GPT-4 summary + analytics: ~$0.10-0.30
- **Total**: ~$0.16-0.36 per 10-minute audio file

## Privacy and Security

- Audio files are sent to OpenAI's servers for processing
- Transcriptions and summaries are processed by OpenAI's models
- No data is stored permanently on OpenAI's servers after processing
- All output files are saved locally on your machine

## License

This project is provided as-is for educational and practical use.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this tool.

---

**Note**: This tool requires an active OpenAI API key. You can get one at [platform.openai.com](https://platform.openai.com/api-keys).
