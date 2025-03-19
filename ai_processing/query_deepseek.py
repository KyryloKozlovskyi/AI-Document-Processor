from openai import OpenAI
import argparse
import sys

def query_deepseek(prompt):
    """
    Query the DeepSeek model via OpenRouter API
    
    Args:
        prompt (str): The prompt to send to the model
        
    Returns:
        str: The model's response
    """
    client = OpenAI(
      base_url="https://openrouter.ai/api/v1",
      api_key="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",
    )

    completion = client.chat.completions.create(
      extra_headers={
        "HTTP-Referer": "<YOUR_SITE_URL>", # Optional. Site URL for rankings on openrouter.ai.
        "X-Title": "<YOUR_SITE_NAME>", # Optional. Site title for rankings on openrouter.ai.
      },
      model="deepseek/deepseek-r1-distill-llama-70b:free",
      messages=[
        {
          "role": "user",
          "content": prompt
        }
      ]
    )

    print(completion.choices[0].message.content)
    return completion.choices[0].message.content

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
