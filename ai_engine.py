import google.generativeai as genai
import json
import os

def analyze_cv_gap(cv_text, job_desc, lang="ID"):
    """
    Menganalisis kecocokan antara teks CV dan Deskripsi Pekerjaan menggunakan Gemini API.
    Menerapkan System Instruction untuk menghasilkan response JSON yang konsisten dalam Bahasa Indonesia atau Inggris.
    """
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY tidak dikonfigurasi. Silakan atur di environment variable atau st.secrets.")
        
    genai.configure(api_key=api_key)
    
    # Menggunakan model gemini-1.5-flash untuk respon cepat dan andal
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    lang_instruction = "Berikan respons dalam BAHASA INDONESIA." if lang == "ID" else "Provide the response entirely in ENGLISH."
    
    prompt = f"""
    Anda adalah sistem ATS (Applicant Tracking System) senior dan Penasihat Karir profesional.
    Tugas Anda adalah membandingkan CV dengan Deskripsi Pekerjaan (Job Description) yang diberikan.
    
    CRITICAL INSTRUCTION:
    {lang_instruction} Berikan respons dalam bahasa yang sesuai (ID atau EN) berdasarkan argumen yang diberikan.
    
    Teks CV Pelamar:
    \"\"\"
    {cv_text}
    \"\"\"
    
    Teks Deskripsi Pekerjaan:
    \"\"\"
    {job_desc}
    \"\"\"
    
    Lakukan analisis komparatif dan berikan hasil analisis dalam format JSON murni. JANGAN menambahkan teks penjelasan di luar format JSON.
    Format JSON harus memiliki kunci sebagai berikut:
    {{
        "ats_score": <skala_0_sampai_100>,
        "missing_skills": [<daftar_skill_kunci_dari_deskripsi_kerja_yang_tidak_ada_di_cv_dalam_bahasa_yang_dipilih>],
        "strengths": [<keunggulan_mendasar_dari_cv_terhadap_posisi_tersebut_dalam_bahasa_yang_dipilih>],
        "recommendations": [<rekomendasi_langkah_nyata_untuk_meningkatkan_cv_dalam_bahasa_yang_dipilih>]
    }}
    """
    
    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error AI Engine: {e}")
        return {
            "ats_score": 0,
            "missing_skills": ["Gagal memproses AI / Failed to process AI: " + str(e)],
            "strengths": [],
            "recommendations": []
        }

def generate_cover_letter(cv_text, job_desc, lang="ID"):
    """
    Menghasilkan Surat Lamaran Kerja (Cover Letter) profesional berdasarkan CV dan Deskripsi Pekerjaan menggunakan Gemini API.
    """
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY tidak dikonfigurasi. Silakan atur.")
        
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    lang_instruction = "Tulis Cover Letter Anda dalam BAHASA INDONESIA secara sopan, formal, dan menarik." if lang == "ID" else "Write your Cover Letter entirely in ENGLISH using a highly polished, professional, and enthusiastic corporate tone."
    
    prompt = f"""
    Anda adalah konsultan karir profesional dan penulis resume handal.
    Tugas Anda adalah merangkai Surat Lamaran Kerja (Cover Letter) yang persuasif dan memikat untuk posisi pekerjaan yang ditargetkan menggunakan detail dari CV pelamar.
    
    CRITICAL INSTRUCTION:
    {lang_instruction} Berikan respons dalam bahasa yang sesuai (ID atau EN) berdasarkan argumen yang diberikan.
    
    Teks CV Pelamar:
    \"\"\"
    {cv_text}
    \"\"\"
    
    Teks Deskripsi Pekerjaan:
    \"\"\"
    {job_desc}
    \"\"\"
    
    Output harus berupa teks Markdown murni dari Surat Lamaran tersebut langsung (tanpa komentar pengantar, pembuka chat, atau label pembungkus code).
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Gagal membuat cover letter / Failed to generate cover letter: {str(e)}"
