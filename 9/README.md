# Service Analyzer

An AI-powered console application that generates comprehensive analysis reports for digital services and platforms using the OpenAI API.

## Overview

The Service Analyzer accepts either a known service name (like "Spotify" or "Notion") or raw service description text and generates a structured markdown report with multiple perspectives including business, technical, and user-focused insights.

## Features

- **Dual Input Modes**: Analyze known services by name or custom service descriptions
- **AI-Powered Analysis**: Uses OpenAI GPT-4 for intelligent content generation
- **Structured Output**: Generates markdown reports with 8 comprehensive sections
- **Flexible Output**: Display in console or save to file
- **Few-Shot Learning**: Uses examples to ensure consistent, high-quality output

## Generated Report Sections

Each analysis includes:

1. **Brief History** - Founding details, key milestones
2. **Target Audience** - Primary user segments and demographics
3. **Core Features** - Top 2-4 key functionalities
4. **Unique Selling Points** - Key differentiators from competitors
5. **Business Model** - Revenue generation methods
6. **Tech Stack Insights** - Technology hints and infrastructure
7. **Perceived Strengths** - Standout features and advantages
8. **Perceived Weaknesses** - Limitations and areas for improvement

## Prerequisites

- Python 3.7 or higher
- OpenAI API key
- Internet connection

## Installation

1. **Clone or download the project files**:
   ```bash
   # If using git
   git clone <repository-url>
   cd service-analyzer
   
   # Or download and extract the files to a directory
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up your OpenAI API key**:
   
   **Option A: Environment Variable (Recommended)**
   ```bash
   # Linux/Mac
   export OPENAI_API_KEY='your-api-key-here'
   
   # Windows Command Prompt
   set OPENAI_API_KEY=your-api-key-here
   
   # Windows PowerShell
   $env:OPENAI_API_KEY='your-api-key-here'
   ```
   
   **Option B: Create a .env file**
   ```bash
   echo "OPENAI_API_KEY=your-api-key-here" > .env
   ```

## Usage

### Basic Usage

**Analyze a known service:**
```bash
python service_analyzer.py --service "Spotify"
```

**Analyze from service description:**
```bash
python service_analyzer.py --text "Our platform helps students organize their study schedules with AI-powered recommendations and collaboration features."
```

### Advanced Usage

**Save output to file:**
```bash
python service_analyzer.py --service "Notion" --output notion_analysis.md
```

**Use short flags:**
```bash
python service_analyzer.py -s "Discord" -o discord_report.md
python service_analyzer.py -t "A mobile app for food delivery" -o food_app_analysis.md
```

### Command Line Options

| Option | Short | Description | Required |
|--------|-------|-------------|----------|
| `--service` | `-s` | Known service name (e.g., "Spotify", "Notion") | One of --service or --text |
| `--text` | `-t` | Raw service description text | One of --service or --text |
| `--output` | `-o` | Output file path (optional, defaults to console) | No |
| `--help` | `-h` | Show help message | No |

## Examples

### Example 1: Analyzing Spotify
```bash
python service_analyzer.py --service "Spotify"
```

### Example 2: Analyzing Custom Service Description
```bash
python service_analyzer.py --text "We're building a platform that connects pet owners with local veterinarians for virtual consultations. Our app includes appointment scheduling, medical records storage, and real-time video calls with certified vets."
```

### Example 3: Saving to File
```bash
python service_analyzer.py --service "Slack" --output slack_analysis.md
```

## Output Format

The application generates markdown-formatted reports that can be:
- Displayed directly in the terminal
- Saved to `.md` files for documentation
- Easily converted to other formats (HTML, PDF, etc.)

## Error Handling

The application handles common errors gracefully:

- **Missing API Key**: Clear instructions on how to set the environment variable
- **API Errors**: Network issues, quota limits, or invalid API keys
- **File Errors**: Permission issues when saving output files
- **Input Validation**: Ensures either service name or description is provided

## API Usage and Costs

- Uses OpenAI GPT-4 model for analysis
- Typical analysis consumes ~1,500-2,000 tokens
- Cost per analysis: approximately $0.03-0.06 USD
- Ensure your OpenAI account has sufficient credits

## Troubleshooting

### Common Issues

1. **"OPENAI_API_KEY environment variable not set"**
   - Solution: Set the environment variable as shown in the installation section

2. **"Error analyzing service: API key not found"**
   - Solution: Verify your API key is correct and has sufficient credits

3. **"Permission denied" when saving files**
   - Solution: Check write permissions for the output directory

4. **ImportError for openai module**
   - Solution: Run `pip install -r requirements.txt`

### Getting Help

If you encounter issues:
1. Check that all dependencies are installed: `pip list`
2. Verify your API key is set: `echo $OPENAI_API_KEY` (Linux/Mac) or `echo %OPENAI_API_KEY%` (Windows)
3. Try a simple test: `python service_analyzer.py --service "Google" --output test.md`

## Technical Details

### Dependencies
- `openai>=1.0.0` - OpenAI API client
- `python-dotenv>=1.0.0` - Environment variable loading support

### Architecture
- **ServiceAnalyzer Class**: Main logic for API interaction and prompt engineering
- **Few-Shot Prompting**: Uses examples to guide AI output consistency
- **Structured Output**: Enforces markdown format with required sections
- **Error Handling**: Comprehensive error management and user feedback

### Prompt Engineering
The application uses sophisticated prompt engineering techniques:
- **Few-shot learning** with 2 detailed examples
- **Structured output constraints** for consistent formatting
- **Context-aware prompting** for known services vs. descriptions
- **Temperature control** (0.7) for balanced creativity and accuracy

## Security Notes

- **Never commit API keys** to version control
- Store API keys in environment variables or secure credential managers
- The application does not log or store API keys or responses
- All API communication uses HTTPS encryption

## License

This project is provided as-is for educational and development purposes.
