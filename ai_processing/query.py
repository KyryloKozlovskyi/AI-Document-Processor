import os
import sys
import json
import argparse
from openai import OpenAI
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import tempfile

def extract_text_from_pdf(pdf_path, lang='eng', dpi=300, poppler_path=r'C:\Program Files\poppler-24.08.0\Library\bin'):
    """
    Extract text from a PDF file using Tesseract OCR.
    
    Args:
        pdf_path (str): Path to the PDF file
        lang (str): Language for OCR (default: 'eng' for English)
        dpi (int): DPI for PDF to image conversion (higher is better quality but slower)
        poppler_path (str): Path to Poppler binaries
    
    Returns:
        str: Extracted text from the PDF
    """
    # Set the path to the Tesseract executable
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    
    # Create temporary directory to store images
    with tempfile.TemporaryDirectory() as temp_dir:
        # Convert PDF to images
        # Debug
        # print(f"Converting PDF: {pdf_path} to images...")
        # Specify poppler_path for Windows
        images = convert_from_path(pdf_path, dpi=dpi, poppler_path=poppler_path)
        
        # Process each page
        all_text = []
        for i, image in enumerate(images):
            # Save image temporarily
            temp_img_path = os.path.join(temp_dir, f'page_{i}.png')
            image.save(temp_img_path, 'PNG')
            
            # Apply OCR
            # Debug
            # print(f"Processing page {i+1}/{len(images)}...")
            text = pytesseract.image_to_string(Image.open(temp_img_path), lang=lang)
            all_text.append(text)
            
            # Remove temporary image file
            os.remove(temp_img_path)
    
    # Join all pages to one string and return
    return '\n\n'.join(all_text)

def query_model(prompt, model="meta-llama/llama-4-maverick:free"):
    """
    Query an AI model via OpenRouter API using the OpenAI client library.
    
    Args:
        prompt (str): The prompt to send to the model
        model (str): The model to use
    
    Returns:
        str: The model's response
    """
    
    api_key = args.key
    try:
        # If we don't have an API key, print error
        if not api_key:
            return "Error: No OpenRouter API key found."
        
        # Initialise the OpenAI client with OpenRouter base URL
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )
        
        # Make the API request
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "https://ai-document-processor.com",  # Replace with your actual domain
                "X-Title": "AI Document Processor"  # Optional site title for rankings
            },
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant with a commitment to providing high-effort, detailed responses. The context of this application is to process documents and provide analysis. The user may provide document text, and you should respond with comprehensive, thoughtful information regarding their query. Take your time to think through complex problems step by step and provide thorough explanations. Use only ASCII characters in your responses."},
                {"role": "user", "content": prompt}
            ]
        )
        
        # Return the response content
        return completion.choices[0].message.content
            
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    # Set up argument parser
    parser = argparse.ArgumentParser(description="Query the AI model")
    parser.add_argument("--query", "-q", type=str, help="The query/prompt to send to the model")
    parser.add_argument("--key", "-a", type=str, help="OpenRouter API key")
    parser.add_argument("--pdf", "-p", type=str, help="Optional: Path to PDF file to provide context")
    args = parser.parse_args()
    
    # Check if required arguments are provided
    if not args.query:
        print("Error: No query provided")
        sys.exit(1)
    
    try:
        # If PDF file is provided, extract text and include it in the prompt
        pdf_text = ""
        if args.pdf and os.path.isfile(args.pdf):
            # Debug
            # print(f"Extracting text from PDF: {args.pdf}")
            pdf_text = extract_text_from_pdf(args.pdf)
            
            # Truncate PDF text if too long (in case of token limits)
            MAX_CHARS = 20000
            if len(pdf_text) > MAX_CHARS:
                pdf_text = pdf_text[:MAX_CHARS] + "...[text truncated due to length]"
            
            # Construct prompt with PDF context
            full_prompt = f"""Here is the text extracted from a PDF document:

{pdf_text}

Based on this document, please answer the following question:
{args.query}"""
        else:
            # Use just the query if no PDF is provided
            full_prompt = args.query
        
        # Return model response
        response = query_model(full_prompt)
        print(response)
        # Return success
        sys.exit(0)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
