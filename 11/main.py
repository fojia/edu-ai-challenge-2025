#!/usr/bin/env python3
"""
Audio Transcription and Analysis Tool

This console application transcribes audio files using OpenAI's Whisper API,
generates summaries using GPT, and extracts meaningful analytics from the content.
"""

import os
import sys
import json
import argparse
from datetime import datetime
from pathlib import Path
import re
from typing import Dict, List, Tuple
import openai
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class AudioAnalyzer:
    """Main class for audio transcription and analysis"""
    
    def __init__(self, api_key: str = None):
        """Initialize the AudioAnalyzer with OpenAI API key"""
        if api_key:
            self.client = OpenAI(api_key=api_key)
        else:
            # Try to get API key from environment variable
            api_key = os.getenv('OPENAI_API_KEY')
            if not api_key:
                raise ValueError("OpenAI API key not found. Please set OPENAI_API_KEY environment variable or pass it as parameter.")
            self.client = OpenAI(api_key=api_key)
    
    def transcribe_audio(self, audio_file_path: str) -> str:
        """
        Transcribe audio file using OpenAI Whisper API
        
        Args:
            audio_file_path: Path to the audio file
            
        Returns:
            Transcribed text
        """
        try:
            print(f"🎵 Transcribing audio file: {audio_file_path}")
            
            with open(audio_file_path, "rb") as audio_file:
                transcript = self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text"
                )
            
            print("✅ Transcription completed successfully!")
            return transcript
            
        except Exception as e:
            print(f"❌ Error during transcription: {str(e)}")
            raise
    
    def generate_summary(self, transcript: str) -> str:
        """
        Generate a summary of the transcript using GPT
        
        Args:
            transcript: The transcribed text
            
        Returns:
            Summary text
        """
        try:
            print("📝 Generating summary...")
            
            prompt = f"""
            Please provide a clear and concise summary of the following transcript. 
            Focus on the main points, key topics discussed, and important takeaways.
            Keep the summary well-structured and easy to read.
            
            Transcript:
            {transcript}
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that creates clear, concise summaries of spoken content."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.3
            )
            
            summary = response.choices[0].message.content.strip()
            print("✅ Summary generated successfully!")
            return summary
            
        except Exception as e:
            print(f"❌ Error during summary generation: {str(e)}")
            raise
    
    def calculate_analytics(self, transcript: str) -> Dict:
        """
        Calculate analytics from the transcript including word count, WPM, and topics
        
        Args:
            transcript: The transcribed text
            
        Returns:
            Dictionary containing analytics data
        """
        try:
            print("📊 Calculating analytics...")
            
            # Calculate word count
            words = transcript.split()
            word_count = len(words)
            
            # For WPM calculation, we need to estimate audio duration
            # Since we don't have exact duration, we'll use GPT to help estimate
            duration_prompt = f"""
            Based on this transcript, please estimate how long the audio recording was in minutes.
            Consider typical speaking pace and content density. Return only a number (the duration in minutes).
            
            Transcript:
            {transcript}
            """
            
            duration_response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {"role": "system", "content": "You are an expert at estimating speech duration from transcripts. Return only the estimated duration in minutes as a number."},
                    {"role": "user", "content": duration_prompt}
                ],
                max_tokens=50,
                temperature=0.1
            )
            
            # Extract duration and calculate WPM
            try:
                duration_minutes = float(duration_response.choices[0].message.content.strip())
                speaking_speed_wpm = round(word_count / duration_minutes) if duration_minutes > 0 else 0
            except:
                # Fallback: assume average speaking rate of 150 WPM
                speaking_speed_wpm = 150
                duration_minutes = word_count / 150
            
            # Extract topics using GPT
            topics_prompt = f"""
            Analyze the following transcript and identify the most frequently mentioned topics or themes.
            Return your response as a JSON array of objects, where each object has "topic" and "mentions" fields.
            Focus on the top 5 most important topics. Count how many times each topic or related concepts are mentioned.
            
            Format your response as valid JSON only, like this example:
            [
                {{"topic": "Customer Service", "mentions": 8}},
                {{"topic": "Product Development", "mentions": 5}},
                {{"topic": "Budget Planning", "mentions": 3}}
            ]
            
            Transcript:
            {transcript}
            """
            
            topics_response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {"role": "system", "content": "You are an expert at analyzing text and extracting key topics. Always return valid JSON format."},
                    {"role": "user", "content": topics_prompt}
                ],
                max_tokens=500,
                temperature=0.2
            )
            
            # Parse topics response
            try:
                topics_text = topics_response.choices[0].message.content.strip()
                # Clean up the response to ensure it's valid JSON
                topics_text = topics_text.replace('```json', '').replace('```', '').strip()
                frequently_mentioned_topics = json.loads(topics_text)
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                frequently_mentioned_topics = [
                    {"topic": "General Discussion", "mentions": 1}
                ]
            
            analytics = {
                "word_count": word_count,
                "speaking_speed_wpm": speaking_speed_wpm,
                "estimated_duration_minutes": round(duration_minutes, 1),
                "frequently_mentioned_topics": frequently_mentioned_topics
            }
            
            print("✅ Analytics calculated successfully!")
            return analytics
            
        except Exception as e:
            print(f"❌ Error during analytics calculation: {str(e)}")
            raise
    
    def save_results(self, transcript: str, summary: str, analytics: Dict, audio_filename: str) -> Tuple[str, str, str]:
        """
        Save transcription, summary, and analytics to separate files
        
        Args:
            transcript: The transcribed text
            summary: The generated summary
            analytics: The analytics data
            audio_filename: Original audio filename for naming
            
        Returns:
            Tuple of (transcription_file, summary_file, analytics_file) paths
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_name = Path(audio_filename).stem
        
        # Create filenames with timestamp
        transcription_file = f"transcription_{base_name}_{timestamp}.md"
        summary_file = f"summary_{base_name}_{timestamp}.md"
        analytics_file = f"analysis_{base_name}_{timestamp}.json"
        
        # Save transcription
        with open(transcription_file, 'w', encoding='utf-8') as f:
            f.write(f"# Transcription - {base_name}\n\n")
            f.write(f"**Generated on:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write(f"**Source Audio:** {audio_filename}\n\n")
            f.write("## Transcript\n\n")
            f.write(transcript)
        
        # Save summary
        with open(summary_file, 'w', encoding='utf-8') as f:
            f.write(f"# Summary - {base_name}\n\n")
            f.write(f"**Generated on:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write(f"**Source Audio:** {audio_filename}\n\n")
            f.write("## Summary\n\n")
            f.write(summary)
        
        # Save analytics
        with open(analytics_file, 'w', encoding='utf-8') as f:
            json.dump(analytics, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Results saved:")
        print(f"   📄 Transcription: {transcription_file}")
        print(f"   📋 Summary: {summary_file}")
        print(f"   📊 Analytics: {analytics_file}")
        
        return transcription_file, summary_file, analytics_file
    
    def process_audio(self, audio_file_path: str) -> None:
        """
        Main method to process audio file - transcribe, summarize, and analyze
        
        Args:
            audio_file_path: Path to the audio file to process
        """
        try:
            # Validate audio file exists
            if not os.path.exists(audio_file_path):
                raise FileNotFoundError(f"Audio file not found: {audio_file_path}")
            
            print(f"🚀 Starting audio processing for: {audio_file_path}")
            print("=" * 60)
            
            # Step 1: Transcribe audio
            transcript = self.transcribe_audio(audio_file_path)
            
            # Step 2: Generate summary
            summary = self.generate_summary(transcript)
            
            # Step 3: Calculate analytics
            analytics = self.calculate_analytics(transcript)
            
            # Step 4: Save results
            transcription_file, summary_file, analytics_file = self.save_results(
                transcript, summary, analytics, audio_file_path
            )
            
            # Step 5: Display results in console
            print("\n" + "=" * 60)
            print("📊 ANALYSIS RESULTS")
            print("=" * 60)
            
            print("\n📋 SUMMARY:")
            print("-" * 40)
            print(summary)
            
            print("\n📊 ANALYTICS:")
            print("-" * 40)
            print(json.dumps(analytics, indent=2, ensure_ascii=False))
            
            print("\n" + "=" * 60)
            print("✅ Processing completed successfully!")
            print("All results have been saved to separate files.")
            
        except Exception as e:
            print(f"\n❌ Error processing audio: {str(e)}")
            sys.exit(1)


def main():
    """Main function to handle command line arguments and run the application"""
    parser = argparse.ArgumentParser(
        description="Audio Transcription and Analysis Tool",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py audio.mp3
  python main.py path/to/audio.wav --api-key sk-your-api-key
        """
    )
    
    parser.add_argument(
        "audio_file",
        help="Path to the audio file to process"
    )
    
    parser.add_argument(
        "--api-key",
        help="OpenAI API key (if not set as environment variable)"
    )
    
    args = parser.parse_args()
    
    try:
        # Initialize analyzer
        analyzer = AudioAnalyzer(api_key=args.api_key)
        
        # Process the audio file
        analyzer.process_audio(args.audio_file)
        
    except Exception as e:
        print(f"❌ Application error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main() 