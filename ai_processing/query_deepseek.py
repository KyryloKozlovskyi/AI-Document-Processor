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

# Debug: Check if API key is loaded
# print(f"API key loaded: {'Yes' if api_key else 'No'}")

# Deepseek model: deepseek/deepseek-r1-distill-llama-70b:free
def query_model(prompt, model="meta-llama/llama-4-maverick:free"):
    """
    Query an AI model via OpenRouter API using the OpenAI client library.
    
    Args:
        prompt (str): The prompt to send to the model
        model (str): The model to use
    
    Returns:
        str: The model's response
    """
    try:
        if not api_key:
            print("No OpenRouter API key found. Using fallback analysis.")
            return fallback_analysis(prompt)
        
        # Initialise the OpenAI client with OpenRouter base URL
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )
        
        # Make the API request
        # Debug
        # print(f"Sending request to OpenRouter API for model: {model}")
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
        return fallback_analysis(prompt)

def fallback_analysis(prompt):
    """
    Provide basic text analysis when API is not available.
    
    Args:
        prompt (str): The original prompt containing the document text
    
    Returns:
        str: A basic analysis of the document
    """
    # Extract just the document text from the prompt
    prompt_parts = prompt.split("\n\n", 1)
    if len(prompt_parts) > 1:
        text = prompt_parts[1]
    else:
        text = prompt
    
    # Perform basic analysis
    lines = text.split("\n")
    word_count = len(text.split())
    
    # Try to determine document type
    doc_type = "Unknown document type"
    if "resume" in text.lower() or "cv" in text.lower() or "experience" in text.lower() and "education" in text.lower():
        doc_type = "Resume/CV"
    elif "invoice" in text.lower() or "payment" in text.lower() and "amount" in text.lower():
        doc_type = "Invoice"
    elif "application" in text.lower() or "form" in text.lower():
        doc_type = "Application Form"
    
    # Extract some key information
    key_lines = []
    for line in lines:
        line = line.strip()
        if len(line) > 0 and len(line) < 100:  # Reasonably sized lines are likely important
            key_lines.append(line)
    
    key_lines = key_lines[:10]  # Limit to 10 key lines
    
    analysis = f"""
# Document Analysis (Local Analysis Mode)

## Document Information
- **Document Type**: {doc_type}
- **Word Count**: {word_count}
- **Line Count**: {len(lines)}

## Key Information
The document appears to contain the following key information:

{chr(10).join(['- ' + line for line in key_lines])}

## Note
This is a basic analysis performed locally. To get more detailed analysis, please configure an OpenRouter API key in your .env file.

To set up the API key:
1. Create a .env file in the project root directory
2. Add the line: OPENROUTER_API_KEY=your_api_key_here
3. Restart the application
"""
    
    return analysis

if __name__ == "__main__":
    # Set up argument parser
    parser = argparse.ArgumentParser(description="Query the AI model")
    parser.add_argument("--query", "-q", type=str, help="The query/prompt to send to the model")
    args = parser.parse_args()
    
    # Pass provided query to model
    if not args.query:
      # Return error
      print("Error: No query provided")
      sys.exit(1)
    
    try:
        # Return model response
        response = query_model(args.query)
        # print(response) # Print is picked up by Node.js process
        # Return success
        sys.exit(0)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
