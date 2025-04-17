import os
from pdf2image import convert_from_path
from PIL import Image
import pytesseract
import tempfile
import sys
import argparse

# Import the query_model function
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from query_deepseek import query_model

# Set the path to the Tesseract executable
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def extract_text_from_pdf(pdf_path, lang='eng', dpi=300, poppler_path=None):
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
    
    # Join all pages and return
    return '\n\n'.join(all_text)


def process_pdf_directory(directory_path, output_directory=None, lang='eng', poppler_path=None, analyze=False):
    """
    Process all PDFs in a directory and save extracted text to files.
    
    Args:
        directory_path (str): Directory containing PDF files
        output_directory (str, optional): Directory to save text files, defaults to same as input
        lang (str): Language for OCR (default: 'eng')
        poppler_path (str): Path to Poppler binaries
        analyze (bool): Whether to analyze the text with DeepSeek model
    """
    if output_directory is None:
        output_directory = directory_path
    
    # Create output directory if it doesn't exist
    os.makedirs(output_directory, exist_ok=True)
    
    # Process each PDF in directory
    for filename in os.listdir(directory_path):
        if filename.lower().endswith('.pdf'):
            pdf_path = os.path.join(directory_path, filename)
            # Debug
            # print(f"Processing {filename}...")
            
            try:
                # Extract text from PDF
                text = extract_text_from_pdf(pdf_path, lang=lang, poppler_path=poppler_path)
                
                # Save to text file
                txt_filename = os.path.splitext(filename)[0] + '.txt'
                txt_path = os.path.join(output_directory, txt_filename)
                
                with open(txt_path, 'w', encoding='utf-8') as txt_file:
                    txt_file.write(text)
                
                # Debug
                # print(f"Successfully created {txt_filename}")
                
                # Analyze with DeepSeek if requested
                if analyze:
                    analyze_text_with_deepseek(text, os.path.join(output_directory, 
                                              os.path.splitext(filename)[0] + '_analysis.txt'))
                
            except Exception as e:
                print("Sorry, I encountered an error while processing the PDF file.")
                print(f"Error processing {filename}: {e}")
                print(f"Please try again later.")


def analyze_text_with_deepseek(text, output_file=None, prompt_prefix=""):
    """
    Analyze the extracted text using the DeepSeek model.
    
    Args:
        text (str): The text to analyze
        output_file (str, optional): Path to save the analysis
        prompt_prefix (str): Additional context for the prompt
    
    Returns:
        str: The AI's analysis of the text
    """
    # Truncate text if too long (most models have token limits)
    MAX_CHARS = 12000  # Approximate limit - adjust as needed
    if len(text) > MAX_CHARS:
        analysis_text = text[:MAX_CHARS] + "...[text truncated due to length]"
    else:
        analysis_text = text
        
    # Create prompt with improved instructions
    if not prompt_prefix:
        prompt_prefix = """The following is text extracted from a PDF document using OCR. 
Please analyze this document and provide a structured summary that includes:

1. Document type and purpose
2. Key information and data points
3. Main findings or conclusions
4. Any action items or next steps mentioned

If the document appears to be a CV/resume, please summarize:
- Professional background and experience
- Skills and qualifications
- Education
- Key achievements

If the document is a form or application:
- What kind of form/application it is
- Key information provided
- Any missing or incomplete sections

Please be concise but thorough in your analysis:"""
    
    prompt = f"{prompt_prefix}\n\n{analysis_text}"
    
    # Call the DeepSeek model
    analysis = query_model(prompt)
    
    # Save to file if output path specified
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(analysis)
        print(f"Analysis saved to {output_file}")
    
    return analysis


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process PDFs with OCR and optionally analyze with DeepSeek")
    parser.add_argument("--pdf", "-p", type=str, help="Path to PDF file or directory")
    parser.add_argument("--output", "-o", type=str, help="Output directory for processed files")
    parser.add_argument("--analyze", "-a", action="store_true", help="Analyze extracted text with DeepSeek")
    parser.add_argument("--direct-output", "-d", action="store_true", help="Output analysis directly to stdout without saving to file")
    parser.add_argument("--poppler", type=str, default=r"C:\Program Files\poppler-24.08.0\Library\bin",
                        help="Path to Poppler binaries")
    
    args = parser.parse_args()
    
    # If no path provided, use the example
    pdf_path = args.pdf if args.pdf else "Fionn McCarthy.pdf"
    poppler_path = args.poppler
    
    # For single file
    if os.path.isfile(pdf_path):
        # print(f"Processing single file: {pdf_path}")
        text = extract_text_from_pdf(pdf_path, poppler_path=poppler_path)
        
        # Save extracted text to file if not in direct output mode
        if not args.direct_output:
            output_dir = args.output if args.output else os.path.dirname(pdf_path)
            os.makedirs(output_dir, exist_ok=True)
            
            txt_filename = os.path.splitext(os.path.basename(pdf_path))[0] + '.txt'
            txt_path = os.path.join(output_dir, txt_filename)
            
            with open(txt_path, 'w', encoding='utf-8') as txt_file:
                txt_file.write(text)
            
            # Debug
            # print(f"Extracted text saved to {txt_path}")
        
        # Analyze with DeepSeek if requested
        if args.analyze or args.direct_output:
            if args.direct_output:
                # Output directly to stdout instead of saving to file
                analysis = analyze_text_with_deepseek(text)
                print(analysis)  # This will be captured by Node.js
            else:
                analysis_file = os.path.join(
                    args.output if args.output else os.path.dirname(pdf_path), 
                    os.path.splitext(os.path.basename(pdf_path))[0] + '_analysis.txt'
                )
                analyze_text_with_deepseek(text, analysis_file)
    
    # For a directory of PDFs
    elif os.path.isdir(pdf_path):
        # Debug
        # print(f"Processing directory: {pdf_path}")
        process_pdf_directory(pdf_path, args.output, poppler_path=poppler_path, analyze=args.analyze)
    
    else:
        print(f"Error: {pdf_path} is not a valid file or directory")