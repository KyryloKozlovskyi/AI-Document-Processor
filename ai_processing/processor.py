import os
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import tempfile

# Set the path to the Tesseract executable
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe' 

def extract_text_from_pdf(pdf_path, lang='eng', dpi=300, poppler_path=None):
    """
    Extract text from a PDF file using Tesseract OCR.
    
    Args:
        pdf_path (str): Path to the PDF file
        lang (str): Language for OCR (default: 'eng' for English)
        dpi (int): DPI for PDF to image conversion (higher is better quality but slower)
        poppler_path (str): Path to Poppler bin directory
    
    Returns:
        str: Extracted text from the PDF
    """
    # Create temporary directory to store images
    with tempfile.TemporaryDirectory() as temp_dir:
        # Convert PDF to images
        print(f"Converting PDF: {pdf_path} to images...")
        # Specify poppler_path for Windows
        images = convert_from_path(pdf_path, dpi=dpi, poppler_path=poppler_path)
        
        # Process each page
        all_text = []
        for i, image in enumerate(images):
            # Save image temporarily
            temp_img_path = os.path.join(temp_dir, f'page_{i}.png')
            image.save(temp_img_path, 'PNG')
            
            # Apply OCR
            print(f"Processing page {i+1}/{len(images)}...")
            text = pytesseract.image_to_string(Image.open(temp_img_path), lang=lang)
            all_text.append(text)
            
            # Remove temporary image file
            os.remove(temp_img_path)
        
    # Join all pages and return
    return '\n\n'.join(all_text)


def process_pdf_directory(directory_path, output_directory=None, lang='eng', poppler_path=None):
    """
    Process all PDFs in a directory and save extracted text to files.
    
    Args:
        directory_path (str): Directory containing PDF files
        output_directory (str, optional): Directory to save text files, defaults to same as input
        lang (str): Language for OCR (default: 'eng')
        poppler_path (str): Path to Poppler binaries
    """
    if output_directory is None:
        output_directory = directory_path
    
    # Create output directory if it doesn't exist
    os.makedirs(output_directory, exist_ok=True)
    
    # Process each PDF in directory
    for filename in os.listdir(directory_path):
        if filename.lower().endswith('.pdf'):
            pdf_path = os.path.join(directory_path, filename)
            print(f"Processing {filename}...")
            
            try:
                # Extract text from PDF
                text = extract_text_from_pdf(pdf_path, lang=lang, poppler_path=poppler_path)
                
                # Save to text file
                txt_filename = os.path.splitext(filename)[0] + '.txt'
                txt_path = os.path.join(output_directory, txt_filename)
                
                with open(txt_path, 'w', encoding='utf-8') as txt_file:
                    txt_file.write(text)
                
                print(f"Successfully created {txt_filename}")
                
            except Exception as e:
                print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    # Example usage
    pdf_path = r"test.pdf" 
    
    # Specify the path to the Poppler binaries
    poppler_path = r"C:\Program Files\poppler-24.08.0\Library\bin"  # Adjust this path as needed
    
    # For single file
    if os.path.isfile(pdf_path):
        text = extract_text_from_pdf(pdf_path, poppler_path=poppler_path)
        print("Extracted text:")
        print(text)
    
    # For a directory of PDFs
    # process_pdf_directory("path/to/pdf/directory", "path/to/output/directory", poppler_path=poppler_path)