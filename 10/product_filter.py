#!/usr/bin/env python3
"""
Product Filtering System using OpenAI Function Calling
=====================================================

This application allows users to search for products using natural language
and leverages OpenAI's function calling capability to filter products
from a JSON dataset.
"""

import json
import os
import sys
from typing import List, Dict, Any, Optional
from openai import OpenAI
from dotenv import load_dotenv


class ProductFilter:
    def __init__(self, products_file: str = "products.json"):
        """Initialize the ProductFilter with products data."""
        self.products = self._load_products(products_file)
        self.client = self._setup_openai_client()
        
    def _load_products(self, products_file: str) -> List[Dict[str, Any]]:
        """Load products from JSON file."""
        try:
            with open(products_file, 'r') as file:
                products = json.load(file)
                print(f"✅ Loaded {len(products)} products from {products_file}")
                return products
        except FileNotFoundError:
            print(f"❌ Error: {products_file} not found!")
            sys.exit(1)
        except json.JSONDecodeError:
            print(f"❌ Error: Invalid JSON in {products_file}!")
            sys.exit(1)

    def _setup_openai_client(self) -> OpenAI:
        """Setup OpenAI client with API key."""
        # Load environment variables from .env file
        load_dotenv()
        
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("❌ Error: OPENAI_API_KEY not found!")
            print("Please either:")
            print("1. Create a .env file with: OPENAI_API_KEY=your-api-key-here")
            print("2. Set environment variable: export OPENAI_API_KEY='your-api-key-here'")
            print("3. Copy env_template.txt to .env and add your API key")
            sys.exit(1)
        
        return OpenAI(api_key=api_key)

    def filter_products(self, products: List[Dict[str, Any]], **filters) -> List[Dict[str, Any]]:
        """
        Filter products based on provided criteria.
        This function will be called by OpenAI based on the function schema.
        """
        filtered = products.copy()
        
        # Filter by specific product names (GPT can specify exact products that match the criteria)
        if filters.get('product_names'):
            product_names = filters['product_names']
            if isinstance(product_names, list):
                filtered = [p for p in filtered if p['name'] in product_names]
            else:
                # If it's a single string, convert to list
                filtered = [p for p in filtered if p['name'] == product_names]
        
        # Filter by category
        if filters.get('category'):
            category = filters['category'].lower()
            filtered = [p for p in filtered if p['category'].lower() == category]
        
        # Filter by maximum price
        if filters.get('max_price') is not None:
            max_price = float(filters['max_price'])
            filtered = [p for p in filtered if p['price'] <= max_price]
        
        # Filter by minimum price
        if filters.get('min_price') is not None:
            min_price = float(filters['min_price'])
            filtered = [p for p in filtered if p['price'] >= min_price]
        
        # Filter by minimum rating
        if filters.get('min_rating') is not None:
            min_rating = float(filters['min_rating'])
            filtered = [p for p in filtered if p['rating'] >= min_rating]
        
        # Filter by stock availability
        if filters.get('in_stock') is not None:
            in_stock = filters['in_stock']
            filtered = [p for p in filtered if p['in_stock'] == in_stock]
        
        return filtered

    def get_function_schema(self) -> Dict[str, Any]:
        """Define the function schema for OpenAI function calling."""
        return {
            "name": "filter_products",
            "description": "Filter products based on user preferences and criteria. You can either use general filters (category, price, rating, stock) OR specify exact product names that match the user's criteria.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_names": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of specific product names that match the user's criteria. Use this when you want to return specific products that match the user's request (e.g., when they ask for 'novels', specify the exact novel names from the dataset)."
                    },
                    "category": {
                        "type": "string",
                        "description": "Product category (Electronics, Fitness, Kitchen, Books, Clothing)",
                        "enum": ["Electronics", "Fitness", "Kitchen", "Books", "Clothing"]
                    },
                    "max_price": {
                        "type": "number",
                        "description": "Maximum price for products"
                    },
                    "min_price": {
                        "type": "number",
                        "description": "Minimum price for products"
                    },
                    "min_rating": {
                        "type": "number",
                        "description": "Minimum rating for products (0.0 to 5.0)"
                    },
                    "in_stock": {
                        "type": "boolean",
                        "description": "Whether products should be in stock"
                    }
                },
                "required": []
            }
        }

    def search_products(self, user_query: str) -> List[Dict[str, Any]]:
        """Search products using OpenAI function calling."""
        try:
            # Create a comprehensive context about available products
            categories = list(set(p['category'] for p in self.products))
            price_range = f"${min(p['price'] for p in self.products):.2f} - ${max(p['price'] for p in self.products):.2f}"
            
            system_message = f"""You are a product search assistant. You have access to a dataset of {len(self.products)} products across these categories: {', '.join(categories)}.

Price range: {price_range}
Rating range: 0.0 - 5.0

Available products:
{json.dumps(self.products, indent=2)}

Based on the user's natural language query, call the filter_products function with appropriate parameters to find matching products. You have two main approaches:

**Approach 1: Use specific product names (PREFERRED for specific requests)**
When users ask for specific types of products (like "novels", "laptops", "headphones"), analyze the product dataset and directly specify the exact product names that match their criteria using the product_names parameter.

For example:
- "novel books" → product_names: ["Novel", "Science Novel", "Fiction Novel"]
- "laptops" → product_names: ["Laptop for Gaming"]
- "headphones" → product_names: ["Wireless Headphones", "Noise-Cancelling Headphones"]

**IMPORTANT: When using product_names, be smart about additional filters:**
- If user asks for "great novels" or "novels with high reviews", first check the actual ratings of the novels in the dataset
- Set min_rating to a realistic threshold that will actually return results
- For example, if novels have ratings 4.1-4.3, set min_rating to 4.0 or 4.1, NOT 4.5
- If the user wants the "best" or "highest rated" of a specific product type, you can either:
  1. Use product_names with only the highest-rated items of that type, OR
  2. Use product_names with all items of that type + reasonable min_rating

**Approach 2: Use general filters**
For broader searches, use the general filter parameters:
- Words like "cheap", "affordable", "budget" suggest lower max_price
- Words like "premium", "high-quality", "expensive" suggest higher min_price  
- Words like "highly rated", "best", "top-rated" suggest higher min_rating
- Words like "available", "in stock" suggest in_stock=true
- Specific categories should map to the category parameter
- Price mentions like "under $100", "less than $50" should set max_price
- Rating mentions like "4+ stars", "highly rated" should set min_rating

**Combining approaches:**
You can combine product_names with other filters (like min_rating, max_price, in_stock) to further refine the results, but make sure the combination will actually return products!

Always prioritize the user's specific intent and ensure your filters will return relevant results."""

            messages = [
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_query}
            ]

            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=messages,
                functions=[self.get_function_schema()],
                function_call={"name": "filter_products"}
            )

            # Extract function call arguments
            function_call = response.choices[0].message.function_call
            if function_call and function_call.name == "filter_products":
                try:
                    arguments = json.loads(function_call.arguments)
                    print(f"🔍 OpenAI determined filters: {arguments}")
                    
                    # Apply the filters
                    filtered_products = self.filter_products(self.products, **arguments)
                    return filtered_products
                    
                except json.JSONDecodeError:
                    print("❌ Error parsing function arguments from OpenAI")
                    return []
            else:
                print("❌ OpenAI did not call the expected function")
                return []

        except Exception as e:
            print(f"❌ Error calling OpenAI API: {str(e)}")
            return []

    def display_results(self, products: List[Dict[str, Any]]) -> None:
        """Display filtered products in a nice format."""
        if not products:
            print("\n❌ No products found matching your criteria.")
            return

        print(f"\n✅ Found {len(products)} matching product(s):")
        print("=" * 60)
        
        for i, product in enumerate(products, 1):
            stock_status = "In Stock" if product['in_stock'] else "Out of Stock"
            stock_emoji = "✅" if product['in_stock'] else "❌"
            
            print(f"{i}. {product['name']}")
            print(f"   Category: {product['category']}")
            print(f"   Price: ${product['price']:.2f}")
            print(f"   Rating: {product['rating']}/5.0 ⭐")
            print(f"   Stock: {stock_status} {stock_emoji}")
            print("-" * 40)

    def run(self) -> None:
        """Main application loop."""
        print("🛍️  Welcome to the AI-Powered Product Search System!")
        print("=" * 60)
        print("This system uses OpenAI's function calling to understand your")
        print("natural language queries and find matching products.")
        print("\nExample queries:")
        print("• 'I need electronics under $100 that are in stock'")
        print("• 'Show me highly rated fitness equipment'") 
        print("• 'Find affordable kitchen appliances'")
        print("• 'I want premium books with great reviews'")
        print("\nType 'quit' or 'exit' to leave.\n")

        while True:
            try:
                user_input = input("🔍 What are you looking for? ").strip()
                
                if not user_input:
                    print("Please enter a search query.")
                    continue
                
                if user_input.lower() in ['quit', 'exit', 'q']:
                    print("👋 Thanks for using the Product Search System!")
                    break
                
                print(f"\n🤖 Processing your query: '{user_input}'")
                
                # Search products using OpenAI function calling
                results = self.search_products(user_input)
                
                # Display results
                self.display_results(results)
                print()
                
            except KeyboardInterrupt:
                print("\n\n👋 Thanks for using the Product Search System!")
                break
            except Exception as e:
                print(f"❌ An error occurred: {str(e)}")


def main():
    """Main entry point."""
    filter_system = ProductFilter()
    filter_system.run()


if __name__ == "__main__":
    main() 