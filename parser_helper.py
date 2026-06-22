import PyPDF2
import io

def extract_text_from_pdf(uploaded_file):
    """
    Mengekstrak teks dari file PDF yang diunggah di Streamlit menggunakan PyPDF2.
    """
    try:
        pdf_reader = PyPDF2.PdfReader(uploaded_file)
        text = ""
        for page in pdf_reader.pages:
            extracted_text = page.extract_text()
            if extracted_text:
                text += extracted_text + "\n"
        return text.strip()
    except Exception as e:
        raise RuntimeError(f"Gagal mengekstrak teks dari file PDF: {str(e)}")
