import sys
import os
import pkg_resources

def check_environment():
    """Test the Python environment and dependencies"""
    print("Python version:", sys.version)
    print("Current working directory:", os.getcwd())
    
    # Check if required packages are installed
    required_packages = ['pytesseract', 'pdf2image', 'Pillow', 'requests', 'python-dotenv']
    
    print("\nChecking required packages:")
    for package in required_packages:
        try:
            version = pkg_resources.get_distribution(package).version
            print(f"✓ {package} version {version}")
        except pkg_resources.DistributionNotFound:
            print(f"✗ {package} is NOT installed")
    
    # Check Tesseract installation
    import shutil
    tesseract_path = shutil.which('tesseract')
    print("\nTesseract installation:")
    if (tesseract_path):
        print(f"✓ Tesseract found at: {tesseract_path}")
    else:
        print("✗ Tesseract not found in PATH")
    
    # Try to import pytesseract to check configuration
    try:
        import pytesseract
        print(f"Pytesseract config path: {pytesseract.pytesseract.tesseract_cmd}")
    except Exception as e:
        print(f"Error with pytesseract: {e}")
    
    # Check for Poppler
    poppler_path = r"C:\Program Files\poppler-24.08.0\Library\bin"
    print("\nPoppler installation:")
    if os.path.exists(poppler_path):
        print(f"✓ Poppler directory exists at: {poppler_path}")
    else:
        print(f"✗ Poppler directory not found at: {poppler_path}")
    
    # Check OpenRouter API key
    try:
        from dotenv import load_dotenv
        load_dotenv()
        api_key = os.getenv("OPENROUTER_API_KEY")
        print("\nOpenRouter API Configuration:")
        if api_key:
            if api_key == "your_openrouter_api_key_here":
                print("✗ OpenRouter API key is set to default placeholder value")
            else:
                print("✓ OpenRouter API key is configured")
                # Don't print the actual key for security reasons
        else:
            print("✗ OpenRouter API key is not set")
    except Exception as e:
        print(f"Error checking OpenRouter API key: {e}")
    
if __name__ == "__main__":
    check_environment()
    print("\nEnvironment check complete.")