import os
import sys
import json
import argparse
from dotenv import load_dotenv
from openai import OpenAI

# Find .env file and load environment variables
load_dotenv()

# Get API key from environment variable
api_key = os.getenv("OPENROUTER_API_KEY", None)
print(f"API key loaded: {'Yes' if api_key else 'No'}")
if api_key:
    # Print just the first few and last few characters for security
    print(f"API KEY: {api_key}")

def query_deepseek(prompt, model="deepseek/deepseek-r1-distill-llama-70b:free"):
    """
    Query an AI model via OpenRouter API using the OpenAI client library.
    
    Args:
        prompt (str): The prompt to send to the model
        model (str): The model to use
    
    Returns:
        str: The model's response
    """
    try:
        # If we don't have an API key, use our fallback
        print(f"Api_key: {api_key}")
        if not api_key:
            print("No OpenRouter API key found. Using fallback analysis.")
            return fallback_analysis(prompt)
        
        # Initialise the OpenAI client with OpenRouter base URL
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )
        
        # Make the API request
        print(f"Sending request to OpenRouter API for model: {model}")
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "https://ai-document-processor.com",  # Replace with your actual domain
                "X-Title": "AI Document Processor"  # Optional site title for rankings
            },
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ]
        )
        
        # Return the response content
        return completion.choices[0].message.content
            
    except Exception as e:
        print(f"Error querying OpenRouter API: {e}")
        return str(e)

if __name__ == "__main__":
    # Set up argument parser
    parser = argparse.ArgumentParser(description="Query the DeepSeek model")
    parser.add_argument("--query", "-q", type=str, help="The query/prompt to send to the model")
    args = parser.parse_args()
    
    # Pass provided query to model
    if not args.query:
      # Return error
      print("Error: No query provided")
      sys.exit(1)
    
    try:
        # Return model response
        response = query_deepseek(args.query)
        print(response)
        # Return success
        sys.exit(0)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
