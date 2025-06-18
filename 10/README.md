# 🛍️ AI-Powered Product Filtering System

An intelligent product search system that uses OpenAI's function calling capabilities to filter products based on natural language queries. Instead of traditional hardcoded filtering logic, this system leverages AI to understand user preferences and automatically apply the appropriate filters.

## 🎯 Features

- **Natural Language Processing**: Search using plain English queries like "I need affordable electronics that are in stock"
- **OpenAI Function Calling**: Utilizes OpenAI's function calling to translate natural language into structured filter parameters
- **Smart Interpretation**: AI understands context clues like "budget", "premium", "highly rated", etc.
- **Console Interface**: Easy-to-use command-line interface
- **Rich Results Display**: Beautiful formatted output with emojis and detailed product information

## 🏗️ Architecture

This application demonstrates several key AI concepts:

1. **OpenAI Function Calling**: The model decides when and how to call our `filter_products` function
2. **Natural Language to Structure Conversion**: User queries are converted to JSON filter parameters
3. **Reasoning over Datasets**: The AI analyzes the product database to understand context and make intelligent filtering decisions

## 📋 Requirements

- Python 3.7 or higher
- OpenAI API key
- Internet connection for API calls

## 🚀 Quick Start

### 1. Clone or Download the Project

```bash
# If you have the files already, navigate to the project directory
cd /path/to/your/project
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Set Up OpenAI API Key

You need an OpenAI API key to use this application. Get one from [OpenAI's website](https://platform.openai.com/api-keys).

**Option A: Using .env file (Recommended)**
```bash
# Copy the template file
cp env_template.txt .env

# Edit the .env file and replace 'your-openai-api-key-here' with your actual API key
nano .env
```

**Option B: Environment Variable**
```bash
export OPENAI_API_KEY='your-api-key-here'
```

**Option C: Add to your shell profile (persistent)**
```bash
echo 'export OPENAI_API_KEY="your-api-key-here"' >> ~/.bashrc
source ~/.bashrc
```

**Option D: Windows Command Prompt**
```cmd
set OPENAI_API_KEY=your-api-key-here
```

**Option E: Windows PowerShell**
```powershell
$env:OPENAI_API_KEY = "your-api-key-here"
```

### 4. Run the Application

```bash
python product_filter.py
```

## 💡 Usage Examples

Once the application starts, you can use natural language queries like:

### Basic Queries
- `electronics under $100`
- `fitness equipment in stock`
- `books with good ratings`
- `affordable kitchen appliances`

### Advanced Queries
- `I need a smartphone under $800 with great ratings`
- `Show me premium fitness equipment that's available`
- `Find highly rated books under $30`
- `I want cheap electronics that are in stock`
- `Looking for quality kitchen appliances under $200`

### Specific Product Type Queries
- `I want a great novel book with excellent reviews` (targets specific novels)
- `gaming laptop with excellent ratings` (targets specific laptop type)
- `wireless headphones under $100` (targets specific headphone type)
- `cookbook for easy recipes` (targets specific book type)
- `smartphone with great camera` (targets specific phone type)

### Complex Filters
- `budget fitness equipment under $50` (targets Fitness, low price)
- `premium cooking appliances in stock` (targets Kitchen, higher price, available)
- `highly rated programming books` (targets Books, specific type, high rating)

## 🔧 How It Works

### 1. Function Schema Definition
The application defines a structured schema that tells OpenAI what parameters are available:

```python
{
    "name": "filter_products",
    "parameters": {
        "product_names": "array of specific product names",
        "category": "Electronics|Fitness|Kitchen|Books|Clothing",
        "max_price": "number",
        "min_price": "number", 
        "min_rating": "number (0.0-5.0)",
        "in_stock": "boolean"
    }
}
```

### 2. AI Interpretation
OpenAI analyzes your natural language query and intelligently maps it to filter parameters:

**For specific product requests:**
- **"novel book"** → analyzes dataset and sets `product_names` to actual novel names like ["Novel: The Great Adventure", "Fantasy Novel", "Mystery Novel", "Science Fiction Novel"]
- **"gaming laptop"** → sets `product_names` to ["Gaming Laptop"]
- **"headphones"** → sets `product_names` to ["Wireless Headphones", "Noise-Cancelling Headphones"]

**For general criteria:**
- **"affordable"** → sets `max_price` to a reasonable threshold
- **"highly rated"** → sets `min_rating` to 4.0+
- **"in stock"** → sets `in_stock` to `true`
- **"electronics"** → sets `category` to "Electronics"

### 3. Intelligent Filtering
The system applies filters based on AI's understanding of your intent. The AI can either:
- **Directly specify matching products** by name when you ask for specific types
- **Apply general filters** for broader searches
- **Combine both approaches** for complex queries

## 📊 Dataset

The application uses `products.json` which contains 50 products across 5 categories:

- **Electronics** (10 items): Headphones, laptops, smartphones, etc.
- **Fitness** (10 items): Yoga mats, treadmills, dumbbells, etc.
- **Kitchen** (10 items): Blenders, air fryers, coffee makers, etc.
- **Books** (10 items): Novels, programming guides, cookbooks, etc.
- **Clothing** (10 items): T-shirts, jeans, shoes, etc.

Each product has:
- `name`: Product name
- `category`: Product category
- `price`: Price in USD
- `rating`: Rating from 0.0 to 5.0
- `in_stock`: Availability status

## 🛠️ Troubleshooting

### Common Issues

**1. "OPENAI_API_KEY not found"**
- Make sure you've created a .env file or set the environment variable (see step 3 above)
- If using .env file, ensure it's in the project root directory
- Verify environment variable is set: `echo $OPENAI_API_KEY` (should show your key)

**2. "No products found matching your criteria"**
- Try broader queries like "electronics" or "under $500"
- Check if products exist in that category/price range

**3. "Error calling OpenAI API"**
- Check your internet connection
- Verify your API key is correct and has credits
- Ensure you have access to GPT-4 model

**4. Import errors**
- Make sure you've installed requirements: `pip install -r requirements.txt`
- Use Python 3.7+ (`python --version`)

### Debugging Mode

To see what filters OpenAI applies, the application shows the determined filters:
```
🔍 OpenAI determined filters: {'category': 'Electronics', 'max_price': 100, 'in_stock': True}
```

## 🧪 Testing the System

Try these test queries to verify everything works:

```bash
# Test basic category filtering
"electronics"

# Test price filtering  
"under $50"

# Test rating filtering
"highly rated products"

# Test stock filtering
"in stock items"

# Test complex queries
"affordable electronics under $100 with good ratings that are in stock"
```

## 📁 Project Structure

```
.
├── product_filter.py    # Main application file
├── products.json        # Product dataset
├── requirements.txt     # Python dependencies
├── env_template.txt     # Environment variables template
├── .env                # Your API keys (create from template)
├── README.md           # This file
└── .gitignore          # Git ignore rules
```

**Note**: The `.env` file is not included in the repository for security reasons. Create it from `env_template.txt`.

## 🎮 Interactive Commands

While running the application:
- Type your search query and press Enter
- Type `quit`, `exit`, or `q` to exit
- Press `Ctrl+C` to force exit

## 🔍 Behind the Scenes

The magic happens in the `search_products` method:

1. **Context Building**: The system provides OpenAI with the complete product dataset
2. **Intelligent Prompting**: A detailed system message guides the AI on how to interpret queries
3. **Function Calling**: OpenAI calls the `filter_products` function with appropriate parameters
4. **Result Processing**: The filtered results are formatted and displayed

## 🚨 API Usage & Costs

- Each query makes 1 API call to OpenAI
- Uses GPT-4 model for better function calling accuracy
- Typical cost: ~$0.01-0.03 per query (depending on dataset size)
- Monitor your usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)

## 🤝 Contributing

Feel free to extend this project by:
- Adding more product categories
- Implementing more complex filtering logic
- Adding a web interface
- Integrating with real e-commerce APIs

## 📄 License

This project is for educational purposes. Make sure to follow OpenAI's usage policies when using their API.

---

**Happy Searching! 🎉**

For issues or questions, check the troubleshooting section above or review the code comments for detailed explanations.
