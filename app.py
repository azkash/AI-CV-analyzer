import streamlit as st
import os
from parser_helper import extract_text_from_pdf
from ai_engine import analyze_cv_gap, generate_cover_letter

# Pengaturan Konfigurasi Halaman Streamlit
st.set_page_config(
    page_title="CareerPro AI",
    page_icon="💼",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Inisialisasi status bahasa default ke 'ID' jika belum diatur
if "lang" not in st.session_state:
    st.session_state.lang = "ID"

# Dictionary translasi multibahasa lengkap
TRANSLATIONS = {
    "ID": {
        "title": "💼 AI Career & Skill Gap Analyzer",
        "subtitle": "Bandingkan CV Anda dengan Deskripsi Lowongan Kerja secara Instan menggunakan Google Gemini API",
        "tab_analysis": "📊 Analisis CV",
        "tab_cover_letter": "✉️ Cover Letter",
        "sidebar_header": "📥 Menu Input Dokumen",
        "cv_upload_label": "Unggah CV Anda (Format PDF)",
        "jd_label": "Tempelkan Deskripsi Lowongan Kerja (Job Description) di sini:",
        "jd_placeholder": "Contoh:\n- Minimal 3 tahun pengalaman di React/Python\n- Menguasai git & RESTful APIs...",
        "btn_analyze": "🚀 Mulai Analisis Karir",
        "btn_generate_cl": "✉️ Buat Cover Letter",
        "error_no_cv": "Gagal memulai: Silakan unggah berkas CV PDF Anda di panel kiri terlebih dahulu.",
        "error_no_jd": "Gagal memulai: Silakan tempelkan konten deskripsi pekerjaan (Job Description) di panel kiri.",
        "progress_extracting": "⏳ Sedang memproses dokumen dan memanggil kecerdasan buatan Gemini...",
        "progress_writing_cl": "⏳ Sedang merangkai Surat Lamaran Kerja kustom Anda...",
        "success_analysis": "🎉 Analisis selesai dengan sukses!",
        "success_cl": "🎉 Surat Lamaran Kerja berhasil dibuat!",
        "score_label": "Kesesuaian ATS (ATS Score)",
        "score_excellent": "🏆 Cocok Luar Biasa! CV Anda sangat selaras dengan kriteria lowongan ini.",
        "score_good": "👍 Cocok Cukup Baik. Peluang Anda bagus, dengan penyesuaian kecil di CV.",
        "score_moderate": "⚠️ Cocok Sedang. Perlu menambah keyword penting untuk meningkatkan ranking ATS.",
        "score_poor": "🚨 Kesesuaian Kurang. Sangat disarankan mereview dan mengambil upskilling.",
        "strengths_title": "🎯 Keunggulan CV Anda (Strengths)",
        "no_strengths": "Tidak ada keunggulan spesifik yang terdeteksi.",
        "missing_title": "⚠️ Gap Kemampuan & Keyword yang Hilang (Missing Skills)",
        "no_missing": "✨ Hebat! Tidak ditemukan gap besar. Seluruh keahlian inti terpenuhi.",
        "recs_title": "📈 Rekomendasi Papan Karir & Rencana Aksi",
        "no_recs": "CV Anda sudah optimal. Selamat melamar pekerjaan!",
        "technical_error": "Terjadi kesalahan teknis: ",
        "welcome_info": "💡 Selamat Datang! Untuk memulai, silakan unggah CV Anda (PDF) dan tempelkan kualifikasi lowongan pada bilah menu di sebelah kiri, kemudian klik **Mulai Analisis Karir**.",
        "cl_tips_title": "💡 TIPS MENULIS SURAT LAMARAN",
        "cl_tip_1_title": "1. Sesuaikan Secara Spesifik",
        "cl_tip_1_desc": "Gunakan bahasa formal yang sopan dan tonjolkan poin penting yang relevan dengan spesifikasi deskripsi pekerjaan.",
        "cl_tip_2_title": "2. Sertakan Metrik Kinerja",
        "cl_tip_2_desc": "Sebutkan persentase pertumbuhan, efisiensi waktu, atau target kontribusi yang pernah Anda capai sebelumnya.",
        "cl_tip_3_title": "3. Buat CTA yang Kuat",
        "cl_tip_3_desc": "Cantumkan ketersediaan dan ketertarikan Anda untuk lanjut ke tahap wawancara untuk mendiskusikan nilai tambah lebih lanjut.",
        "cl_prompt_instructions": "Klik tombol 'Buat Cover Letter' untuk menganalisis kecocokan dan menyusun surat lamaran kustom.",
        "cl_not_found_info": "Surat Lamaran belum dibuat. Klik tombol di atas untuk merangkainya.",
        "cl_header_result": "📄 SURAT LAMARAN HASIL AI",
        "panel_insight": "Penilaian Karir & Rekruiter Insight",
        "fit_rating": "REKOMENDASI KELAYAKAN"
    },
    "EN": {
        "title": "💼 AI Career & Skill Gap Analyzer",
        "subtitle": "Instantly Analyze your CV against Job Description requirements using Google Gemini API",
        "tab_analysis": "📊 CV Analysis",
        "tab_cover_letter": "✉️ Cover Letter",
        "sidebar_header": "📥 Input Documents",
        "cv_upload_label": "Upload your CV/Resume (PDF format)",
        "jd_label": "Paste the Job Description here:",
        "jd_placeholder": "Example:\n- Minimum 3 years experience in React/Python\n- Solid understanding of Git & REST APIs...",
        "btn_analyze": "🚀 Start Career Analysis",
        "btn_generate_cl": "✉️ Generate Cover Letter",
        "error_no_cv": "Failed to start: Please upload your CV/Resume PDF in the left panel first.",
        "error_no_jd": "Failed to start: Please paste the Job Description in the left panel.",
        "progress_extracting": "⏳ Custom parsing documents and querying Gemini AI...",
        "progress_writing_cl": "⏳ Composing your tailored premium cover letter...",
        "success_analysis": "🎉 Analysis completed successfully!",
        "success_cl": "🎉 Cover Letter generated successfully!",
        "score_label": "ATS Match Score",
        "score_excellent": "🏆 Exceptional Match! Your CV is highly aligned with this position's criteria.",
        "score_good": "👍 Good Match. You have solid potential, with small adjustments recommended.",
        "score_moderate": "⚠️ Moderate Match. Adding missing high-priority keywords is recommended.",
        "score_poor": "🚨 Low Match. We highly encourage updating your CV and pursuing upskilling.",
        "strengths_title": "🎯 Core Strengths detected",
        "no_strengths": "No specific strengths detected.",
        "missing_title": "⚠️ Skill Gaps & Missing Keywords",
        "no_missing": "✨ Incredible! No major keyword gaps found. All core skills match.",
        "recs_title": "📈 Actionable Recommendations & Career Plan",
        "no_recs": "Your CV is already fully optimized. Happy job hunting!",
        "technical_error": "Technical error occurred: ",
        "welcome_info": "💡 Welcome! To get started, upload your CV PDF and paste the target job description in the left panel, then hit **Start Career Analysis**.",
        "cl_tips_title": "💡 COVER LETTER WRITING TIPS",
        "cl_tip_1_title": "1. Highly Specific Customization",
        "cl_tip_1_desc": "Use a formal, polite tone and highlight matching accomplishments directly corresponding with qualifications.",
        "cl_tip_2_title": "2. Include Performance Metrics",
        "cl_tip_2_desc": "Mention concrete percentages, time saved, or revenue contributions achieved in previous roles.",
        "cl_tip_3_title": "3. Formulate a Strong CTA",
        "cl_tip_3_desc": "Clearly express your excitement, availability, and prompt for an interview to present your potential value.",
        "cl_prompt_instructions": "Click 'Generate Cover Letter' to compose your customized, persuasive application.",
        "cl_not_found_info": "Cover letter not written yet. Click the button above to generate.",
        "cl_header_result": "📄 GENERATED AI COVER LETTER",
        "panel_insight": "Career Assessment & Recruiter Insight",
        "fit_rating": "ALIGNMENT RATING"
    }
}

# Fungsi translasi global
def translate(text_id, lang):
    lang_dict = TRANSLATIONS.get(lang, TRANSLATIONS["ID"])
    return lang_dict.get(text_id, text_id)

# Custom Style CSS untuk design mewah minimalis modern berkelas dengan dukung toggle bahasa
st.markdown("""
<style>
    /* Global Theme Overrides untuk high-contrast premium light style */
    .stApp {
        background-color: #F8FAFC !important;
        color: #0F172A !important;
    }
    body {
        background-color: #F8FAFC !important;
        color: #0F172A !important;
    }
    .main-title {
        color: #1E293B;
        font-size: 38px;
        font-weight: 800;
        letter-spacing: -1px;
    }
    .highlight-card {
        background-color: rgba(255, 255, 255, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.5);
        border-radius: 20px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
        backdrop-filter: blur(12px);
    }
    .ats-score-display {
        font-size: 72px;
        font-weight: 950;
        color: #2B66FF;
        text-align: center;
        margin: 15px 0px;
        text-shadow: 0px 8px 24px rgba(43, 102, 255, 0.18);
    }
    /* Sembunyikan header default streamlit */
    div[data-testid="stHeader"] {
        background-color: transparent !important;
        border: none !important;
    }
    
    /* Glow Backdrop Positioning */
    .glow-container {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 550px;
        overflow: hidden;
        pointer-events: none;
        z-index: 0;
    }
    .glow-orb {
        position: absolute;
        border-radius: 50%;
        opacity: 0.85;
    }
</style>
""", unsafe_allow_html=True)

def render_header():
    """Renders the professional modern borderless light header and background gradient glows"""
    st.markdown("""
    <div class="glow-container">
        <div class="glow-orb" style="background: rgba(43, 102, 255, 0.14); left: 5%; width: 450px; height: 450px; filter: blur(110px); top: -150px;"></div>
        <div class="glow-orb" style="background: rgba(34, 211, 238, 0.14); left: 35%; width: 500px; height: 500px; filter: blur(120px); top: -170px;"></div>
        <div class="glow-orb" style="background: rgba(251, 191, 36, 0.12); right: 5%; width: 420px; height: 420px; filter: blur(100px); top: -120px;"></div>
    </div>
    
    <style>
        .custom-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(12px);
            border: none;
            padding: 16px 32px;
            border-radius: 20px;
            margin-bottom: 20px;
            font-family: 'Inter', -apple-system, sans-serif;
            position: relative;
            z-index: 10;
        }
        .header-logo {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .logo-box {
            width: 36px;
            height: 36px;
            background: #2B66FF;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(43, 102, 255, 0.2);
        }
        .logo-svg {
            width: 20px;
            height: 20px;
        }
        .logo-text {
            font-size: 20px;
            font-weight: 850;
            color: #0F172A;
            letter-spacing: -0.7px;
        }
    </style>
    """, unsafe_allow_html=True)

# Membaca GOOGLE_API_KEY
if "GOOGLE_API_KEY" not in os.environ:
    if hasattr(st, "secrets") and "GOOGLE_API_KEY" in st.secrets:
        os.environ["GOOGLE_API_KEY"] = st.secrets["GOOGLE_API_KEY"]
    else:
        st.sidebar.warning("⚠️ GOOGLE_API_KEY belum dikonfigurasi. Harap atur di secrets Anda.")

# Render background layout glows
render_header()

# Header Layout dengan Logo dan Toggle Bahasa di pojok kanan atas sejajar logo
header_col1, header_col2 = st.columns([10, 2])
with header_col1:
    st.markdown("""
        <div class="custom-header" style="margin-bottom: 0px; padding: 12px 24px;">
            <div class="header-logo">
                <div class="logo-box">
                    <svg class="logo-svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5" opacity="0.8"/>
                        <path d="M2 12l10 5 10-5" opacity="0.5"/>
                    </svg>
                </div>
                <span class="logo-text">CareerPro AI</span>
            </div>
        </div>
    """, unsafe_allow_html=True)

with header_col2:
    # Toggle Bahasa elegant pilahan ID / EN
    lang_opts = ["ID", "EN"]
    current_idx = lang_opts.index(st.session_state.lang)
    lang_choice = st.selectbox(
        "Language / Bahasa",
        options=lang_opts,
        index=current_idx,
        key="lang_toggle"
    )
    if lang_choice != st.session_state.lang:
        st.session_state.lang = lang_choice
        st.rerun()

lang = st.session_state.lang

# Judul Utama Berdasarkan Bahasa yang Dipilih
st.title(translate("title", lang))
st.subheader(translate("subtitle", lang))
st.markdown("---")

# Layout Menggunakan Sidebar untuk Input Dokumen Bersama
with st.sidebar:
    st.markdown(f"### {translate('sidebar_header', lang)}")
    
    # Upload Berkas
    uploaded_file = st.file_uploader(translate("cv_upload_label", lang), type=["pdf"])
    
    # Input Job Description
    job_desc = st.text_area(
        translate("jd_label", lang),
        height=280,
        placeholder=translate("jd_placeholder", lang)
    )

# Tata Letak Utama dengan Tabs: Analisis CV dan Cover Letter
tab_analysis, tab_cover_letter = st.tabs([
    translate("tab_analysis", lang),
    translate("tab_cover_letter", lang)
])

# ================= TAB 1: ANALISIS CV GAP =================
with tab_analysis:
    # Tombol Analisis ada di tab Analisis
    tombol_analisis = st.button(translate("btn_analyze", lang), use_container_width=True)
    
    if tombol_analisis:
        if not uploaded_file:
            st.error(translate("error_no_cv", lang))
        elif not job_desc.strip():
            st.error(translate("error_no_jd", lang))
        else:
            with st.spinner(translate("progress_extracting", lang)):
                try:
                    # 1. Ekstraksi teks dari PDF
                    cv_text = extract_text_from_pdf(uploaded_file)
                    
                    # 2. Panggil AI Engine dengan argument bahasa
                    hasil = analyze_cv_gap(cv_text, job_desc, lang=lang)
                    
                    st.success(translate("success_analysis", lang))
                    
                    # 3. Visualisasi Hasil Dashboard Elegan
                    col1, col2 = st.columns([1.2, 2])
                    
                    with col1:
                        st.markdown(f"""
                        <div class="highlight-card">
                            <h4 style="text-align: center; color: #8E8E93; text-transform: uppercase; font-size: 13px; letter-spacing: 1px;">{translate('score_label', lang)}</h4>
                        """, unsafe_allow_html=True)
                        score = hasil.get("ats_score", 0)
                        st.markdown(f'<div class="ats-score-display">{score}%</div>', unsafe_allow_html=True)
                        
                        # Indikator Tingkat Kelayakan
                        if score >= 85:
                            st.balloons()
                            st.success(translate("score_excellent", lang))
                        elif score >= 65:
                            st.info(translate("score_good", lang))
                        elif score >= 40:
                            st.warning(translate("score_moderate", lang))
                        else:
                            st.error(translate("score_poor", lang))
                        
                        st.markdown("</div>", unsafe_allow_html=True)
                    
                    with col2:
                        st.markdown(f"### {translate('strengths_title', lang)}")
                        
                        # Strengths
                        strengths = hasil.get("strengths", [])
                        if strengths:
                            for s in strengths:
                                st.write(f"🟢 **{s}**")
                        else:
                            st.write(translate("no_strengths", lang))
                        
                        st.markdown("<br>", unsafe_allow_html=True)
                        
                        # Missing Skills Gap
                        st.markdown(f"### {translate('missing_title', lang)}")
                        missing = hasil.get("missing_skills", [])
                        if missing:
                            for m in missing:
                                st.write(f"🔴 **{m}**")
                        else:
                            st.write(translate("no_missing", lang))
                    
                    st.markdown("---")
                    
                    # Rekomendasi
                    st.markdown(f"### {translate('recs_title', lang)}")
                    recommendations = hasil.get("recommendations", [])
                    if recommendations:
                        for idx, r in enumerate(recommendations, 1):
                            st.markdown(f"**{idx}. {r}**")
                    else:
                        st.write(translate("no_recs", lang))
                        
                except Exception as e:
                    st.error(f"{translate('technical_error', lang)}{str(e)}")
    else:
        # Panduan awal analisis yang intuitif
        st.info(translate("welcome_info", lang))


# ================= TAB 2: AI COVER LETTER GENERATOR =================
with tab_cover_letter:
    col_tips, col_letter = st.columns([1, 1.8])
    
    with col_tips:
        st.markdown(f"#### {translate('cl_tips_title', lang)}")
        st.markdown(f"""
        **{translate('cl_tip_1_title', lang)}**  
        {translate('cl_tip_1_desc', lang)}  
        
        **{translate('cl_tip_2_title', lang)}**  
        {translate('cl_tip_2_desc', lang)}  
        
        **{translate('cl_tip_3_title', lang)}**  
        {translate('cl_tip_3_desc', lang)}  
        """)
        st.caption(translate("cl_prompt_instructions", lang))
        
    with col_letter:
        tombol_cl = st.button(translate("btn_generate_cl", lang), use_container_width=True)
        
        if tombol_cl:
            if not uploaded_file:
                st.error(translate("error_no_cv", lang))
            elif not job_desc.strip():
                st.error(translate("error_no_jd", lang))
            else:
                with st.spinner(translate("progress_writing_cl", lang)):
                    try:
                        cv_text = extract_text_from_pdf(uploaded_file)
                        cl_output = generate_cover_letter(cv_text, job_desc, lang=lang)
                        
                        st.success(translate("success_cl", lang))
                        st.markdown(f"### {translate('cl_header_result', lang)}")
                        st.markdown(cl_output)
                    except Exception as e:
                        st.error(f"{translate('technical_error', lang)}{str(e)}")
        else:
            st.info(translate("cl_not_found_info", lang))
