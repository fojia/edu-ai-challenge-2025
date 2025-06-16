#!/usr/bin/env python3
"""
Service Analyzer - AI-powered service analysis tool
Uses OpenAI API to generate comprehensive reports about digital services.
"""

import os
import sys
import argparse
from openai import OpenAI
from typing import Optional

# Try to load python-dotenv if available (for .env file support)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv is optional


class ServiceAnalyzer:
    def __init__(self, api_key: str):
        """Initialize the Service Analyzer with OpenAI API key."""
        self.client = OpenAI(api_key=api_key)
    
    def create_analysis_prompt(self, input_text: str, is_service_name: bool = False) -> str:
        """Create a structured prompt for service analysis."""
        
        few_shot_examples = """
Example Analysis 1:
Input: "Spotify"
Output:
# Service Analysis Report: Spotify

## Brief History
Founded in 2006 by Daniel Ek and Martin Lorentzon in Stockholm, Sweden. Launched publicly in 2008. Key milestones include reaching 1 million users in 2009, launching in the US in 2011, going public in 2018, and surpassing 500 million users by 2023.

## Target Audience
- Music enthusiasts aged 18-34 (primary demographic)
- Premium subscribers seeking ad-free experience
- Podcast listeners and creators
- Artists and musicians looking for distribution platform

## Core Features
- Music streaming with 100+ million tracks
- Personalized playlists and recommendations
- Podcast hosting and discovery
- Social sharing and collaborative playlists

## Unique Selling Points
- Discover Weekly and algorithm-driven personalization
- Freemium model with robust free tier
- Strong podcast ecosystem integration
- Cross-platform synchronization

## Business Model
- Freemium subscription model (free with ads, premium ad-free)
- Premium subscriptions ($9.99/month individual, family plans)
- Spotify for Artists platform
- Advertising revenue from free tier users

## Tech Stack Insights
- Backend: Java, Python, Node.js
- Data processing: Apache Kafka, Apache Storm
- Machine learning: TensorFlow, proprietary recommendation algorithms
- Infrastructure: Google Cloud Platform, AWS

## Perceived Strengths
- Excellent music discovery algorithms
- User-friendly interface across platforms
- Strong brand recognition and market presence
- Robust free tier attracts users

## Perceived Weaknesses
- Low artist payouts controversy
- Limited high-fidelity audio options
- Dependence on music licensing deals
- Competition from Apple Music, YouTube Music

---

Example Analysis 2:
Input: "Our platform connects freelance developers with startups who need technical expertise. We use AI matching to pair the right talent with projects based on skills, experience, and budget. Developers can showcase portfolios while companies post detailed project requirements."

Output:
# Service Analysis Report: Freelance Developer Platform

## Brief History
Appears to be a contemporary platform leveraging AI for talent matching. Based on description, likely founded in the 2020s during the remote work boom, capitalizing on the gig economy and AI advancement trends.

## Target Audience
- Freelance developers seeking project opportunities
- Startups and small businesses needing technical talent
- Companies looking for cost-effective development solutions
- Remote-first organizations

## Core Features
- AI-powered talent matching system
- Developer portfolio showcasing
- Project requirement posting system
- Skills and experience assessment tools

## Unique Selling Points
- AI-driven matching algorithm for better fit
- Focus on developer-startup ecosystem
- Portfolio-centric approach for talent showcase
- Budget-aware matching system

## Business Model
- Likely commission-based (percentage of project value)
- Possible subscription tiers for enhanced features
- Premium listings for higher visibility
- Transaction fees on completed projects

## Tech Stack Insights
- Machine learning for matching algorithms
- Web application (likely React/Vue.js frontend)
- Database for user profiles and projects
- Payment processing integration
- Possibly cloud-based infrastructure

## Perceived Strengths
- AI matching reduces manual searching time
- Specialized focus on developer-startup niche
- Portfolio integration for better talent assessment
- Budget consideration in matching process

## Perceived Weaknesses
- Dependent on network effects for success
- Competition from established platforms (Upwork, Fiverr)
- Need for quality control in matches
- Potential for AI bias in matching algorithms
"""

        if is_service_name:
            prompt = f"""You are an expert service analyst. Analyze the following well-known service and create a comprehensive report. Use your knowledge about this service to provide accurate, detailed information.

{few_shot_examples}

Now analyze this service:
Input: "{input_text}"

Generate a comprehensive analysis report following the exact same markdown format as the examples above. Include all 8 sections with detailed, accurate information."""
        else:
            prompt = f"""You are an expert service analyst. Analyze the following service description and create a comprehensive report. Extract insights and make reasonable inferences about the service based on the description provided.

{few_shot_examples}

Now analyze this service description:
Input: "{input_text}"

Generate a comprehensive analysis report following the exact same markdown format as the examples above. Include all 8 sections with detailed analysis based on the description provided. Make reasonable inferences where direct information isn't available."""

        return prompt
    
    def analyze_service(self, input_text: str, is_service_name: bool = False) -> str:
        """Analyze a service using OpenAI API and return structured report."""
        try:
            prompt = self.create_analysis_prompt(input_text, is_service_name)
            
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {"role": "system", "content": "You are a professional service analyst who creates detailed, structured reports about digital services and platforms."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"Error analyzing service: {str(e)}"


def get_api_key() -> Optional[str]:
    """Get OpenAI API key from environment variable."""
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("Error: OPENAI_API_KEY environment variable not set.")
        print("Please set your OpenAI API key as an environment variable:")
        print("export OPENAI_API_KEY='your-api-key-here'")
        return None
    return api_key


def main():
    """Main function to run the Service Analyzer."""
    parser = argparse.ArgumentParser(
        description="Service Analyzer - AI-powered service analysis tool",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python service_analyzer.py --service "Notion"
  python service_analyzer.py --text "Our app helps students organize study schedules"
  python service_analyzer.py --service "Discord" --output report.md
        """
    )
    
    # Input options
    input_group = parser.add_mutually_exclusive_group(required=True)
    input_group.add_argument('--service', '-s', help='Known service name (e.g., "Spotify", "Notion")')
    input_group.add_argument('--text', '-t', help='Raw service description text')
    
    # Output options
    parser.add_argument('--output', '-o', help='Output file path (optional, defaults to console)')
    
    args = parser.parse_args()
    
    # Get API key
    api_key = get_api_key()
    if not api_key:
        sys.exit(1)
    
    # Initialize analyzer
    analyzer = ServiceAnalyzer(api_key)
    
    # Determine input type and content
    if args.service:
        input_text = args.service
        is_service_name = True
        print(f"Analyzing known service: {input_text}")
    else:
        input_text = args.text
        is_service_name = False
        print("Analyzing service description...")
    
    print("Generating analysis report...")
    
    # Analyze service
    report = analyzer.analyze_service(input_text, is_service_name)
    
    # Output report
    if args.output:
        try:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(report)
            print(f"Report saved to: {args.output}")
        except Exception as e:
            print(f"Error saving report: {e}")
            sys.exit(1)
    else:
        print("\n" + "="*60)
        print("SERVICE ANALYSIS REPORT")
        print("="*60)
        print(report)


if __name__ == "__main__":
    main() 