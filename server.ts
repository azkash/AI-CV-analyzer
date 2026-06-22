import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON payload limits to support base64 uploads without limits
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Check API key configuration on endpoint trigger rather than crashing on module load
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || "AIzaSyDZ_xVgs_uxyeFT0hijbI-B-afrtVLEMMc";
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the server environment. Please define it in your AI Studio secrets panel.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// API: Career Analysis comparison between CV (PDF or Text) and Job Description
app.post("/api/analyze", async (req, res) => {
  try {
    const { jobDescription, resumeText, resumeFile, lang = "ID" } = req.body;

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ error: "Job description is required" });
    }

    if (!resumeText?.trim() && (!resumeFile || !resumeFile.data)) {
      return res.status(400).json({ error: "Please provide either CV text or upload a CV PDF/file" });
    }

    const ai = getGeminiClient();
    const modelToUse = "gemini-3.1-flash-lite";

    // Prepare content parts
    const parts: any[] = [];

    // Add PDF if provided
    if (resumeFile && resumeFile.data) {
      parts.push({
        inlineData: {
          mimeType: resumeFile.mimeType || "application/pdf",
          data: resumeFile.data // This is the pure base64 string
        }
      });
    }

    const targetLangFull = lang === "ID" ? "INDONESIAN language (Bahasa Indonesia)" : "ENGLISH language (Professional corporate tone)";
    const promptLangDesc = lang === "ID" ? "in Indonesian and use Bahasa Indonesia terms" : "entirely in English";

    // Add prompt instructions
    const promptText = `
You are an elite Applicant Tracking System (ATS), expert Recruiter, and Career Transformation Coach.
Your tone should be that of an expert hiring manager and senior career consultant. Be highly precise, objective, constructive, and smart.
Your task is to analyze the provided CV/Resume against the given Job Description (JD).
Compare them meticulously and determine the skill gaps, strengths, and recommendations.

Job Description:
"""
${jobDescription}
"""

${resumeText ? `Pasted CV/Resume Text:\n"""\n${resumeText}\n"""` : 'The CV/Resume is attached as a PDF document.'}

Please perform a highly intelligent and objective analysis in the ${targetLangFull}.
All text outputs in the JSON (missing_skills, matched_skills, strengths, recommendations, role_insights, ats_report_markdown) MUST be written in the chosen language (${targetLangFull}).

Formulate your response in JSON matching the requested structure.
Make sure your ATS Score is realistic:
- 85-100: Exceptional match, ready to interview
- 65-84: Solid match, some skills/keywords missing but strong core
- 40-64: Moderate match, requires substantial upskilling or editing
- 0-39: Poor match

The response must exactly follow the JSON schema:
{
  "ats_score": number (0 to 100),
  "missing_skills": string[] (crucial keywords or skills listed in the job description that are missing or weak in the CV, ${promptLangDesc}),
  "matched_skills": string[] (important matching skills present in both the CV and job description, ${promptLangDesc}),
  "strengths": string[] (solid achievements, experience matches, and advantages found in the CV, ${promptLangDesc}),
  "recommendations": string[] (targeted, actionable steps to close gaps and optimize the CV for this specific JD, ${promptLangDesc}),
  "role_insights": string (brief, constructive 3-4 sentence evaluation of role fit, ${promptLangDesc}),
  "ats_report_markdown": string (a comprehensive, beautifully styled report with summary of findings, key improvement areas, and a concluding career advice paragraph, using rich Markdown formatting, ${promptLangDesc})
}
    `;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: parts,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "ats_score",
            "missing_skills",
            "matched_skills",
            "strengths",
            "recommendations",
            "role_insights",
            "ats_report_markdown"
          ],
          properties: {
            ats_score: {
              type: Type.INTEGER,
              description: "The Applicant Tracking System match score from 0 to 100."
            },
            missing_skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of missing or weak skills required by the job description."
            },
            matched_skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of matching skills discovered in the CV/Resume."
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Important strengths, experiences, and structural elements of the CV."
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Specific, actionable optimization recommendations to improve CV."
            },
            role_insights: {
              type: Type.STRING,
              description: "Constructive evaluation of the candidate's alignment and potential."
            },
            ats_report_markdown: {
              type: Type.STRING,
              description: "A comprehensive analysis report written with rich Markdown headers, bullet points, and formatting."
            }
          }
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No response generated from Gemini API.");
    }

    // Try parsing the JSON safely
    const parsedData = JSON.parse(textOutput);
    return res.json(parsedData);

  } catch (error: any) {
    console.error("Analysis failed:", error);
    return res.status(500).json({
      error: error.message || "An error occurred during career analysis. Please check your inputs and try again."
    });
  }
});

// API: Generate Cover Letter (Surat Lamaran Kerja) using CV details and Job Description
app.post("/api/cover-letter", async (req, res) => {
  try {
    const { jobDescription, resumeText, resumeFile, lang = "ID" } = req.body;

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ error: "Job description is required" });
    }

    if (!resumeText?.trim() && (!resumeFile || !resumeFile.data)) {
      return res.status(400).json({ error: "Please provide either CV text or upload a CV PDF/file" });
    }

    const ai = getGeminiClient();
    const modelToUse = "gemini-3.1-flash-lite";

    // Prepare content parts
    const parts: any[] = [];

    // Add PDF if provided
    if (resumeFile && resumeFile.data) {
      parts.push({
        inlineData: {
          mimeType: resumeFile.mimeType || "application/pdf",
          data: resumeFile.data
        }
      });
    }

    const targetLangFull = lang === "ID" ? "INDONESIAN language (Bahasa Indonesia)" : "ENGLISH language (Professional corporate English)";
    const styleDescription = lang === "ID" 
      ? `Bahasa Indonesia formal/sopan, meyakinkan, namun tidak berlebih-lebihan. Menekankan pencapaian substantif, inovasi, kepemilikan kerja bervolume tinggi, lincah, serta korelasi kuat dengan kualifikasi deskripsi pekerjaan.` 
      : `sophisticated, highly polished, compelling professional English tone emphasizing product achievements, key metrics, technical ownership, rapid execution, and highly structured qualification alignment.`;

    // Add prompt instructions
    const promptText = `
You are an expert Recruiter, CV Writer, and Career Transformation Coach.
Your task is to write a highly persuasive, stellar, and customized Cover Letter (Surat Lamaran Kerja) in ${targetLangFull}.

Use the details in the provided CV/Resume to match the requirements in the Job Description (JD).
Highlight the candidate's matching strengths, skills, achievements, and experiences to show they are the perfect fit.

The Cover Letter must:
1. Have a professional and polished structure (Greeting/Salutation, Opening paragraph showing enthusiasm for the role, Strong body paragraphs detailing matching expertise and concrete metrics, and a Professional Closing requesting an interview with a Call to Action).
2. Be tailored to the Job Description, focusing on high-priority qualifications.
3. Be written in a ${styleDescription}.
4. Be directly formatted in clean, beautiful Markdown syntax (using bold text, headings, or lists, with clean double spacing).

Job Description:
"""
${jobDescription}
"""

${resumeText ? `CV/Resume Text:\n"""\n${resumeText}\n"""` : 'The CV/Resume is attached as a PDF document.'}

Please output ONLY the final Cover Letter in Markdown, ready to be copied by the user. Do not include any meta-introductions, conversational filler, or wrap-around explanations outside of the cover letter.
    `;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: parts,
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No response generated from Gemini API.");
    }

    return res.json({ cover_letter: textOutput });

  } catch (error: any) {
    console.error("Cover letter generation failed:", error);
    return res.status(500).json({
      error: error.message || "An error occurred during cover letter generation. Please try again."
    });
  }
});

// Endpoint serving the exact requested Python/Streamlit code snippets so users can easily view or download them.
app.get("/api/python-snippets", (req, res) => {
  res.json({
    ai_engine: `import google.generativeai as genai
import json
import os

def analyze_cv_gap(cv_text, job_desc):
    """
    Menganalisis kecocokan antara teks CV dan Deskripsi Pekerjaan menggunakan Gemini API.
    Menerapkan System Instruction untuk menghasilkan response JSON yang konsisten.
    """
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY tidak dikonfigurasi. Silakan atur di environment variable.")
        
    genai.configure(api_key=api_key)
    
    # Menggunakan model gemini-2.5-flash untuk respon cepat dan andal
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    Anda adalah sistem ATS (Applicant Tracking System) senior dan Penasihat Karir profesional.
    Tugas Anda adalah membandingkan CV dengan Deskripsi Pekerjaan (Job Description) yang diberikan.
    
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
        "missing_skills": [<daftar_skill_kunci_dari_deskripsi_kerja_yang_tidak_ada_di_cv>],
        "strengths": [<keunggulan_mendasar_dari_cv_terhadap_posisi_tersebut>],
        "recommendations": [<rekomendasi_langkah_nyata_untuk_meningkatkan_cv_atau_belajar_skill>]
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
            "missing_skills": ["Gagal memproses AI: " + str(e)],
            "strengths": [],
            "recommendations": []
        }
`,
    parser_helper: `import PyPDF2
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
                text += extracted_text + "\\n"
        return text.strip()
    except Exception as e:
        raise RuntimeError(f"Gagal mengekstrak teks dari file PDF: {str(e)}")
`,
    app_py: `import streamlit as st
import os
from parser_helper import extract_text_from_pdf
from ai_engine import analyze_cv_gap

# Pengaturan Konfigurasi Halaman Streamlit
st.set_page_config(
    page_title="AI Career & Skill Gap Analyzer",
    page_icon="💼",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Style CSS
st.markdown("""
<style>
    .ats-score {
        font-size: 72px;
        font-weight: bold;
        color: #9EFF00;
        text-align: center;
        margin-top: -10px;
    }
    .main-header {
        color: #FFFFFF;
        font-size: 36px;
        font-weight: 800;
        letter-spacing: -0.5px;
    }
</style>
""", unsafe_allow_html=True)

# Membaca GOOGLE_API_KEY
if "GOOGLE_API_KEY" not in os.environ:
    # Memeriksa st.secrets terlebih dahulu
    if hasattr(st, "secrets") and "GOOGLE_API_KEY" in st.secrets:
        os.environ["GOOGLE_API_KEY"] = st.secrets["GOOGLE_API_KEY"]
    else:
        st.sidebar.warning("⚠️ GOOGLE_API_KEY belum dikonfigurasi. Harap atur di secrets Anda.")

st.title("💼 AI Career & Skill Gap Analyzer")
st.subheader("Bandingkan CV Anda dengan Deskripsi Lowongan Kerja secara Instan menggunakan Google Gemini API")

st.markdown("---")

# Layout Menggunakan Sidebar untuk Input dan Main Area untuk Hasil
with st.sidebar:
    st.header("📥 Input Dokumen")
    
    # Input File CV
    uploaded_file = st.file_uploader("Unggah CV Anda (Format PDF)", type=["pdf"])
    
    # Input Job Description
    job_desc = st.text_area("Tempelkan Deskripsi Lowongan Kerja (Job Description) di sini:", height=250)
    
    st.markdown("---")
    
    # Tombol Analisis
    tombol_analisis = st.button("🚀 Mulai Analisis Kecocokan", use_container_width=True)

# Main Area untuk menampilkan hasil analisis
if tombol_analisis:
    if not uploaded_file:
        st.error("Silakan unggah file CV Anda terlebih dahulu.")
    elif not job_desc.strip():
        st.error("Silakan masukkan teks Deskripsi Pekerjaan (Job Description).")
    else:
        with st.spinner("⏳ Sedang mengekstrak teks dan melakukan analisis cerdas AI..."):
            try:
                # 1. Ekstraksi teks dari PDF
                cv_text = extract_text_from_pdf(uploaded_file)
                
                # 2. Panggil AI Engine
                hasil = analyze_cv_gap(cv_text, job_desc)
                
                st.success("✅ Analisis Berhasil Diselesaikan!")
                
                # 3. Visualisasi Hasil Dashboard
                col1, col2 = st.columns([1, 2])
                
                with col1:
                    st.markdown("<div style='background-color: #111; padding: 25px; border-radius: 12px; border: 1px solid #333;'>", unsafe_allow_html=True)
                    st.markdown("<h3 style='text-align:center;'>Score Kecocokan ATS</h3>", unsafe_allow_html=True)
                    score = hasil.get("ats_score", 0)
                    st.markdown(f'<div class="ats-score">{score}%</div>', unsafe_allow_html=True)
                    
                    # Indikator Tingkat Kelayakan
                    if score >= 80:
                        st.balloons()
                        st.success("🥇 Kecocokan Sangat Tinggi! CV Anda sangat kuat untuk lowongan ini.")
                    elif score >= 60:
                        st.info("🥈 Kecocokan Cukup Baik. Ada beberapa gap yang perlu disesuaikan.")
                    else:
                        st.warning("🥉 Kecocokan Rendah. Ambil tindakan peningkatan sesuai rekomendasi di bawah.")
                    st.markdown("</div>", unsafe_allow_html=True)
                
                with col2:
                    st.subheader("🎯 Keunggulan Utama Anda (Strengths)")
                    strengths = hasil.get("strengths", [])
                    if strengths:
                        for idx, item in enumerate(strengths):
                            st.write(f"✅ **{item}**")
                    else:
                        st.write("Tidak ada keunggulan signifikan terdeteksi.")
                        
                    st.subheader("⚠️ Gap Kemampuan / Keyword Hilang (Missing Skills)")
                    missing = hasil.get("missing_skills", [])
                    if missing:
                        for idx, item in enumerate(missing):
                            st.write(f"🛑 **{item}**")
                    else:
                        st.write("🎉 Luar biasa! Seluruh skill penting terindikasi ada di CV Anda.")
                
                st.markdown("---")
                
                st.subheader("📈 Rekomendasi Langkah Peningkatan Karir")
                recoms = hasil.get("recommendations", [])
                if recoms:
                    for idx, item in enumerate(recoms):
                        st.write(f"{idx+1}. {item}")
                else:
                    st.write("Tidak ada rekomendasi khusus. CV Anda siap dikirim!")
                    
            except Exception as e:
                st.error(f"Terjadi kesalahan teknis: {str(e)}")
else:
    # Tampilan Selamat Datang sebelum Analisis
    st.info("💡 Selamat datang! Silakan unggah berkas CV PDF Anda dan tempelkan deskripsi pekerjaan di menu kiri, kemudian klik **Mulai Analisis Kecocokan**.")
`,
    requirements: `streamlit>=1.31.0
google-generativeai>=0.4.0
PyPDF2>=3.0.1
pydantic>=2.0
jinja2
`,
    dockerfile: `# Menggunakan Python resmi sebagai base image
FROM python:3.10-slim

# Atur environment variables agar Python berjalan secara efisien
ENV PYTHONUNBUFFERED=1 \\
    PYTHONDONTWRITEBYTECODE=1 \\
    PORT=3000

# Set working directory di dalam container
WORKDIR /app

# Instal dependensi sistem yang diperlukan
RUN apt-get update && apt-get install -y \\
    build-essential \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Salin file requirements.txt terlebih dahulu untuk efisiensi caching docker layer
COPY requirements.txt .

# Instal dependensi Python
RUN pip install --no-cache-dir -r requirements.txt

# Salin seluruh kode aplikasi ke dalam container
COPY . .

# Buat folder konfigurasi default untuk streamlit
mkdir -p ~/.streamlit

# Port 3000 adalah port wajib untuk integrasi Cloud Run di AI Studio
EXPOSE 3000

# Jalankan aplikasi streamlit
CMD ["streamlit", "run", "app.py", "--server.port=3000", "--server.address=0.0.0.0"]
`
  });
});

// Configure Vite or Static Fallback
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
};

export default app;

if (!process.env.VERCEL) {
  startServer();
}
