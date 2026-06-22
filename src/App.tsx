import React, { useState, useEffect, ChangeEvent } from "react";
import { 
  Briefcase, 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  Code, 
  Terminal, 
  Download, 
  Copy, 
  FileCode, 
  Zap, 
  BookOpen, 
  ListTodo, 
  HelpCircle,
  FileBadge,
  Sparkles,
  RefreshCw,
  Cpu,
  Mail,
  ChevronDown,
  Star,
  BarChart3,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";

// Pre-defined high-quality Sample Data for instant onboarding / testing
const SAMPLE_JOB_DESC = `Senior Frontend Engineer (React)
Kualifikasi & Kebutuhan:
- Minimal 3-5 tahun pengalaman profesional dalam pengembangan web frontend
- Keahlian tingkat lanjut dalam React.js, TypeScript, dan pengelolaan state modern (Redux, Zustand)
- Kemampuan menulis kode Tailwind CSS yang bersih, responsif, dan optimal
- Memiliki pemahaman kuat mengenai performance optimization (code splitting, lazy loading, layout shifts)
- Berpengalaman dalam integrasi API Restful dan optimasi SEO teknis
- Terbiasa berkolaborasi menggunakan Git, Docker, serta memahami alur deployment CI/CD`;

const SAMPLE_CV_TEXT = `BUDI SANTOSOS
Senior Frontend Developer | 4+ Tahun Pengalaman

RINGKASAN:
Frontend Engineer yang berdedikasi membangun aplikasi web modern, performan tinggi, dan ramah pengguna. Sangat menyukai ekosistem React dan aktif menulis kode JavaScript/TypeScript yang bersih dan efisien.

KEAHLIAN TEKNIS:
- Bahasa Pemrograman: JavaScript (ES6+), HTML5, CSS3, SQL
- Framework & Library: React.js, Next.js, jQuery, Bootstrap
- Styling: Tailwind CSS, Styled Components, SASS
- State Management: Redux Toolkit
- Tools & Dev-ops: Git, GitHub, Webpack, npm, Vercel

PENGALAMAN KERJA:
1. Frontend Developer - PT Solusi Digital Utama (2022 - Sekarang)
   - Merancang dan membangun re-usable components di React.js untuk dashboard analisis data transaksi.
   - Mengoptimalkan performa halaman e-commerce dengan menerapkan lazy loading sehingga meningkatkan loading speed sebesar 35%.
   - Menggunakan Tailwind CSS untuk menterjemahkan desain Figma menjadi layout web yang 100% responsif di desktop dan mobile.

2. Web Developer - Global Tech Nusantara (2020 - 2022)
   - Memelihara dan mengembangkan fitur platform pembelajaran online berbasis React.
   - Melakukan troubleshooting bug fungsional serta menulis automated testing tingkat dasar.

PENDIDIKAN:
Sarjana Ilmu Komputer - Universitas Indonesia (IPK 3.75)`;

export default function App() {
  const [lang, setLang] = useState<"en" | "id">("en");
  const [heroTab, setHeroTab] = useState<"cv" | "cl">("cv");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const copy = {
    en: {
      headingLine1: "Maximize Career Opportunities",
      headingLine2: "with AI",
      subheading: "Optimize your resume for any ATS. Find skill gaps and get tailored feedback instantly.",
      cta: "Begin Trial",
      tabCv: "CV Analysis",
      tabCl: "Cover Letter",
      overlayCvTitle: "Analyzing Your CV",
      overlayClTitle: "Generating Cover Letter"
    },
    id: {
      headingLine1: "Maksimalkan Peluang Karir",
      headingLine2: "dengan AI",
      subheading: "Optimalkan resume Anda untuk sistem ATS. Temukan celah keahlian dan dapatkan umpan balik instan.",
      cta: "Mulai Trial",
      tabCv: "Analisis CV",
      tabCl: "Cover Letter",
      overlayCvTitle: "Menganalisis CV Anda",
      overlayClTitle: "Membuat Cover Letter"
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroTab((prev) => (prev === "cv" ? "cl" : "cv"));
    }, 4000);
    return () => clearInterval(interval);
  }, [heroTab]);

  const [activeTab, setActiveTab] = useState<"analyzer" | "cover-letter">("analyzer");
  const [jobDescription, setJobDescription] = useState(
    () => sessionStorage.getItem("careerpro_jd") || ""
  );
  const [resumeText, setResumeText] = useState(
    () => sessionStorage.getItem("careerpro_resume_text") || ""
  );
  const [resumeFile, setResumeFile] = useState<{ name: string; type: string; data: string } | null>(null);
  const [fileName, setFileName] = useState(
    () => sessionStorage.getItem("careerpro_filename") || ""
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  // States for cover letter generation
  const [coverLetterText, setCoverLetterText] = useState("");
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [coverLetterError, setCoverLetterError] = useState<string | null>(null);
  const [copiedStatus, setCopiedStatus] = useState(false);

  // Erase uploaded CV and clean workspace function
  const handleClearWorkspace = () => {
    setJobDescription("");
    setResumeText("");
    setResumeFile(null);
    setFileName("");
    setAnalysisResult(null);
    setCoverLetterText("");
    setCoverLetterError(null);
    setErrorStatus(null);
    sessionStorage.removeItem("careerpro_jd");
    sessionStorage.removeItem("careerpro_resume_text");
    sessionStorage.removeItem("careerpro_filename");
    sessionStorage.removeItem("careerpro_last_activity");
  };

  // 15-Minute Session Inactivity and Page Exit Clean-up Tracker
  useEffect(() => {
    const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes of inactivity

    // Clean checks
    const checkSessionActivity = () => {
      const lastActiveStr = sessionStorage.getItem("careerpro_last_activity");
      if (lastActiveStr) {
        const lastActive = parseInt(lastActiveStr, 10);
        if (Date.now() - lastActive > TIMEOUT_DURATION) {
          handleClearWorkspace();
        }
      }
    };

    // Check on startup
    checkSessionActivity();

    // Set initial activity timestamp if it doesn't exist
    if (!sessionStorage.getItem("careerpro_last_activity")) {
      sessionStorage.setItem("careerpro_last_activity", Date.now().toString());
    }

    // Capture activity on human interaction to reset inactivity timer
    const refreshActivityTime = () => {
      sessionStorage.setItem("careerpro_last_activity", Date.now().toString());
    };

    const trackedEvents = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    trackedEvents.forEach((ev) => {
      window.addEventListener(ev, refreshActivityTime, { passive: true });
    });

    // Run active monitoring check interval every 10 seconds
    const activityQueryTimer = setInterval(checkSessionActivity, 10000);

    // Erase CV and clean workspace if user leaves / closes page/tab ("get out from the web")
    const handleBrowserLeave = () => {
      sessionStorage.removeItem("careerpro_jd");
      sessionStorage.removeItem("careerpro_resume_text");
      sessionStorage.removeItem("careerpro_filename");
      sessionStorage.removeItem("careerpro_last_activity");
    };

    window.addEventListener("beforeunload", handleBrowserLeave);
    window.addEventListener("pagehide", handleBrowserLeave);

    return () => {
      trackedEvents.forEach((ev) => {
        window.removeEventListener(ev, refreshActivityTime);
      });
      clearInterval(activityQueryTimer);
      window.removeEventListener("beforeunload", handleBrowserLeave);
      window.removeEventListener("pagehide", handleBrowserLeave);
    };
  }, []);

  // Persistence hooks to sessionStorage and localStorage
  useEffect(() => {
    sessionStorage.setItem("careerpro_jd", jobDescription);
  }, [jobDescription]);

  useEffect(() => {
    sessionStorage.setItem("careerpro_resume_text", resumeText);
  }, [resumeText]);

  useEffect(() => {
    sessionStorage.setItem("careerpro_filename", fileName);
  }, [fileName]);

  // Translation dictionary declared inside the main app context
  const TRANSLATIONS = {
    ID: {
      title: "Maksimalkan Peluang Karir dengan AI",
      navHero: "CAREER NAVIGATION",
      subtitle: "Unggah Curriculum Vitae (CV) Anda dan letakkan lowongan kerja yang diincar. AI akan menganalisis keselarasan ATS, merekomendasikan penambahan kualifikasi, serta menyajikan visualisasi gap secara akurat dan objektif.",
      tabAnalyzer: "Analisis CV",
      tabCoverLetter: "Cover Letter",
      inputHeader: "Input Berkas Lamaran",
      useSample: "Pakai Data Contoh",
      cleanWorkspace: "Bersihkan Workspace",
      jdLabel: "1. DESKRIPSI LOWONGAN KERJA",
      jdMinChar: "Min. 50 Karakter",
      jdPlaceholder: "Salin dan tempelkan kualifikasi lowongan atau tuntutan posisi pekerjaan di sini...",
      cvUploadLabel: "2. UNGGAH CV ATAU CURRICULUM VITAE",
      cvUploadSelect: "Pilih File CV PDF",
      cvUploadedSuccess: "File berhasil diunggah",
      cvUploadFormats: "Mendukung format dokumen .pdf saja",
      orPasteManual: "Atau Masukkan Teks CV Secara Manual",
      cvPastePlaceholder: "Alternatif: Tempel isi teks CV Anda di sini secara langsung...",
      btnAnalyze: "Mulai Analisis Kecocokan",
      btnAnalyzing: "Menganalisis Dokumen...",
      btnAnalyzeInfo: "Jika proses berhenti sebelum selesai, silakan tekan tombol ini kembali. Hal ini dapat terjadi karena limitasi pada server pratinjau yang dibagikan (shared preview server).",
      loadingWaiting: "Harap Menunggu",
      readyTitle: "Siap Menganalisis CV Terbaik Anda",
      readyDesc: "Silakan unggah resume CV Anda dan berikan detail lowongan pada panel kiri. Atau klik " + `"Pakai Data Contoh"` + " untuk simulasi instan dengan data pengembang senior.",
      resultHeader: "HASIL PEMETAAN KOMPETENSI",
      resultTitle: "Dashboard Analisis Karier",
      resultProcessed: "Kecocokan Diproses",
      atsScoreLabel: "ATS Match Score",
      rankExcellent: "REKOMENDASI UTAMA",
      rankModerate: "KELAYAKAN SEDANG",
      rankRevision: "PERLU REVISI UTAMA",
      rankMismatch: "KETIDAKSESUAIAN TINGGI",
      insightHeader: "Penilaian Karir & Rekruiter Insight",
      fitRating: "FIT RATING",
      matchedSkills: "Skill Sesuai (Matched)",
      noMatchedSkills: "Tidak ada keahlian terpetakan",
      missingSkills: "Skill Kurang (Missing Gap)",
      noMissingSkills: "Garis kompetensi optimal (tidak ada gap)",
      strengthsHeader: "Aspek Keunggulan Utama (Strengths)",
      noStrengths: "Analisis keunggulan tidak tersedia",
      recommHeader: "Rencana Strategis (Recommendations)",
      noRecomm: "Rekomendasi tidak tersedia",
      fullReportHeader: "Laporan Detil ATS (Full AI Report)",
      interactiveReportView: "Interactive Report View",
      noReport: "Tidak ada detail teks eksekutif",
      clTitle: "AI Cover Letter Generator",
      clSubtitle: "Hasilkan Surat Lamaran Kerja (Cover Letter) profesional yang disesuaikan secara instan berdasarkan CV dan kualifikasi lowongan Anda di sebelah kiri.",
      clBtnGenerate: "Buat Cover Letter",
      clBtnGenerating: "Menulis Surat Lamaran...",
      clTipsHeader: "TIPS MENULIS SURAT LAMARAN",
      clTip1Title: "1. Sesuaikan Secara Spesifik",
      clTip1Desc: "Gunakan bahasa formal yang sopan dan tonjolkan poin penting yang relevan dengan spesifikasi deskripsi pekerjaan.",
      clTip2Title: "2. Sertakan Metrik Kinerja",
      clTip2Desc: "Sebutkan persentase pertumbuhan, efisiensi waktu, atau target kontribusi yang pernah Anda capai sebelumnya.",
      clTip3Title: "3. Buat CTA yang Kuat",
      clTip3Desc: "Cantumkan ketersediaan dan ketertarikan Anda untuk lanjut ke tahap wawancara untuk mendiskusikan nilai tambah Anda lebih lanjut.",
      clSnergyTitle: "Sinergi Konteks Otomatis",
      clSnergyDesc: "Sistem AI kami otomatis melacak CV teks/PDF terunggah serta deskripsi lowongan kerja aktif dari formulir analisis utama sebagai landasan penyusunan surat.",
      clResultHeader: "SURAT LAMARAN HASIL AI",
      clBtnCopy: "Salin Surat",
      clBtnCopied: "Tersalin!",
      clNotGenerated: "Surat Lamaran Belum Dibuat",
      clNotGeneratedDesc: "Klik tombol Buat Cover Letter di kanan atas untuk menganalisis CV dan merangkai surat lamaran kustom berkelas dunia.",
      footerTitle: "AI Career & Skill Gap Analyzer",
      footerPower: "Diberdayakan oleh Google Gemini & AI Studio Workspace.",
      errorJdRequired: "Mohon masukkan Deskripsi Pekerjaan (Job Description).",
      errorCvRequired: "Mohon unggah file CV PDF atau tempelkan teks CV Anda.",
      errorGenerating: "Gagal membuat cover letter.",
      errorConnecting: "Gagal menghubungi server untuk menghasilkan cover letter.",
      errorNoJdCl: "Mohon masukkan Deskripsi Pekerjaan (Job Description) pada panel input di kiri.",
      errorNoCvCl: "Mohon unggah file CV PDF atau tempelkan teks CV Anda pada panel input di kiri."
    },
    EN: {
      title: "Maximize Career Opportunities with AI",
      navHero: "CAREER NAVIGATION",
      subtitle: "Upload your CV/Resume and paste your targeted job description. AI will analyze ATS alignment, suggest qualifications, and display accurate gap visualizations.",
      tabAnalyzer: "CV Analysis",
      tabCoverLetter: "Cover Letter",
      inputHeader: "Application Documents Input",
      useSample: "Use Sample Data",
      cleanWorkspace: "Clean Workspace",
      jdLabel: "1. JOB DESCRIPTION",
      jdMinChar: "Min. 50 Characters",
      jdPlaceholder: "Copy and paste the job description or requirements here...",
      cvUploadLabel: "2. UPLOAD CV & RESUME",
      cvUploadSelect: "Choose CV PDF File",
      cvUploadedSuccess: "File uploaded successfully",
      cvUploadFormats: "Supports PDF format only",
      orPasteManual: "Or Enter CV Text Manually",
      cvPastePlaceholder: "Alternative: Paste your CV text here directly...",
      btnAnalyze: "Start Match Analysis",
      btnAnalyzing: "Analyzing Documents...",
      btnAnalyzeInfo: "If the process stops before finishing, just press this button again. This can occur due to limitations of the shared preview server.",
      loadingWaiting: "Please Wait",
      readyTitle: "Ready to Begin Your Custom Analysis",
      readyDesc: "Please upload your resume and provide job details in the left panel. Or click " + `"Use Sample Data"` + " for an instant simulation with senior developer data.",
      resultHeader: "COMPETENCY MAPPING RESULT",
      resultTitle: "Career Analysis Dashboard",
      resultProcessed: "Match Alignment Processed",
      atsScoreLabel: "ATS Match Score",
      rankExcellent: "EXCELLENT MATCH",
      rankModerate: "MODERATE MATCH",
      rankRevision: "REVISION RECOMMENDED",
      rankMismatch: "LOW MATCH ALIGNMENT",
      insightHeader: "Career & Recruiter Insight Assessment",
      fitRating: "FIT RATING",
      matchedSkills: "Matched Skills",
      noMatchedSkills: "No matching skills discovered",
      missingSkills: "Missing Skills (Gap)",
      noMissingSkills: "Optimal competency line (no gap)",
      strengthsHeader: "Core Competitive Strengths",
      noStrengths: "Asset evaluation not available",
      recommHeader: "Strategic Career Plan (Recommendations)",
      noRecomm: "Optimization steps not available",
      fullReportHeader: "Detailed ATS Report (Full AI Report)",
      interactiveReportView: "Interactive Report View",
      noReport: "Technical findings not available",
      clTitle: "AI Cover Letter Generator",
      clSubtitle: "Generate a professional Cover Letter tailored instantly to your CV and targeted job description in the left panel.",
      clBtnGenerate: "Generate Cover Letter",
      clBtnGenerating: "Writing Cover Letter...",
      clTipsHeader: "COVER LETTER WRITING TIPS",
      clTip1Title: "1. Highly Specific Customization",
      clTip1Desc: "Use a formal, polite tone and highlight matching accomplishments directly corresponding with qualifications.",
      clTip2Title: "2. Include Performance Metrics",
      clTip2Desc: "Mention concrete percentages, time saved, or revenue contributions achieved in previous roles.",
      clTip3Title: "3. Formulate a Strong CTA",
      clTip3Desc: "Clearly express your excitement, availability, and prompt for an interview to present your potential value.",
      clSnergyTitle: "Automatic Context Synergy",
      clSnergyDesc: "Our AI systems automatically pull your uploaded CV text/PDF and job description from the primary form to construct a hyper-tailored letter.",
      clResultHeader: "GENERATED AI COVER LETTER",
      clBtnCopy: "Copy Letter",
      clBtnCopied: "Copied!",
      clNotGenerated: "Cover Letter Not Generated Yet",
      clNotGeneratedDesc: "Click 'Generate Cover Letter' in the top right to analyze your CV alignment and compose a world-class custom application letter.",
      footerTitle: "AI Career & Skill Gap Analyzer",
      footerPower: "Powered by Google Gemini & AI Studio Workspace.",
      errorJdRequired: "Please enter the Job Description.",
      errorCvRequired: "Please upload your CV PDF or paste your CV text.",
      errorGenerating: "Failed to generate Cover Letter.",
      errorConnecting: "Failed to connect to the server for Cover Letter generation.",
      errorNoJdCl: "Please enter the Job Description in the left panel input.",
      errorNoCvCl: "Please upload your CV PDF or paste your CV text in the left panel input."
    }
  };

  const t = (key: keyof typeof TRANSLATIONS.ID) => {
    const uppercaseLang = (lang === "en" ? "EN" : "ID") as "EN" | "ID";
    return TRANSLATIONS[uppercaseLang][key] || TRANSLATIONS.ID[key];
  };

  // Cover Letter generation function
  const handleGenerateCoverLetter = async () => {
    if (!jobDescription.trim()) {
      setCoverLetterError(t("errorNoJdCl") as string);
      return;
    }
    if (!resumeText.trim() && !resumeFile) {
      setCoverLetterError(t("errorNoCvCl") as string);
      return;
    }

    setIsGeneratingCoverLetter(true);
    setCoverLetterError(null);
    setCoverLetterText("");

    try {
      const response = await fetch("/api/cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          jobDescription,
          resumeText: resumeText || undefined,
          resumeFile: resumeFile || undefined,
          lang: lang.toUpperCase(),
        })
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textError = await response.text();
        const isHtml = textError.trim().startsWith("<") || textError.includes("<!doctype") || textError.includes("<html");
        if (isHtml) {
          throw new Error(
            lang === "id"
              ? "Server mengirimkan tanggapan HTML (bukan JSON). Ini biasanya terjadi ketika server sedang menyala ulang (Cold Start), waktu booting habis, atau kunci API (Secrets Panel) belum dikonfigurasi di deployment baru Anda. Silakan coba klik tombol lagi dalam beberapa saat."
              : "The server returned an HTML page instead of JSON. This typically happens during container cold starts, boot timeouts, or if the API keys have not been configured in your deployment settings. Please click the button again in a few seconds."
          );
        } else {
          throw new Error(textError || `Server error (Status: ${response.status})`);
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (t("errorGenerating") as string));
      }

      setCoverLetterText(data.cover_letter);
    } catch (err: any) {
      console.error(err);
      setCoverLetterError(err.message || (t("errorConnecting") as string));
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  // Coaching tips showing during the analysis progress spinner matching the active language
  const COACHING_TIPS = lang === "id" ? [
    "Mengekstrak berkas lamaran dan memetakan struktur semantik...",
    "Memilah-milah kata kunci kualifikasi dari lowongan pekerjaan...",
    "Merelasikan kecocokan kapabilitas CV terhadap Standard Kompetensi lowongan...",
    "Mengukur tingkat ATS alignment Score secara matematis dan substantif...",
    "Merumuskan strategi rekomendasi perbaikan dan rencana karir taktis...",
    "Menyusun visualisasi dashboard dashboard interaktif..."
  ] : [
    "Extracting application files and mapping semantic properties...",
    "Parsing high-priority qualifications and industry keywords...",
    "Relating candidate competencies to the job qualification matrix...",
    "Computing ATS alignment parameters and keyword densities...",
    "Formulating targeted recommendation pathways and action strategies...",
    "Assembling the interactive metrics dashboard views..."
  ];

  useEffect(() => {
    let timer: any;
    if (isAnalyzing) {
      timer = setInterval(() => {
        setLoadingStep((prev) => (prev < COACHING_TIPS.length - 1 ? prev + 1 : 0));
      }, 3500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(timer);
  }, [isAnalyzing, lang]);

  // Read upload file helper
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = (reader.result as string).split(",")[1];
        setResumeFile({
          name: file.name,
          type: file.type,
          data: base64Data
        });
        // Clear pasted text to prioritize uploaded document
        setResumeText("");
      };
      reader.readAsDataURL(file);
    }
  };

  // Inject sample data
  const handleInjectSampleData = () => {
    setJobDescription(SAMPLE_JOB_DESC);
    setResumeText(SAMPLE_CV_TEXT);
    setResumeFile(null);
    setFileName("Data_Contoh_Mitra_CV.pdf [Internal Simulator]");
  };

  // Run analysis function
  const handleRunAnalysis = async () => {
    if (!jobDescription.trim()) {
      setErrorStatus(t("errorJdRequired") as string);
      return;
    }
    if (!resumeText.trim() && !resumeFile) {
      setErrorStatus(t("errorCvRequired") as string);
      return;
    }

    setIsAnalyzing(true);
    setErrorStatus(null);
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          jobDescription,
          resumeText: resumeText || undefined,
          resumeFile: resumeFile || undefined,
          lang: lang.toUpperCase(),
        })
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textError = await response.text();
        const isHtml = textError.trim().startsWith("<") || textError.includes("<!doctype") || textError.includes("<html");
        if (isHtml) {
          throw new Error(
            lang === "id"
              ? "Server mengirimkan tanggapan HTML (bukan JSON). Ini biasanya terjadi ketika server sedang menyala ulang (Cold Start), waktu booting habis, atau kunci API (Secrets Panel) belum dikonfigurasi di deployment baru Anda. Silakan coba klik tombol lagi dalam beberapa saat."
              : "The server returned an HTML page instead of JSON. This typically happens during container cold starts, boot timeouts, or if the API keys have not been configured in your deployment settings. Please click the button again in a few seconds."
          );
        } else {
          throw new Error(textError || `Server error (Status: ${response.status})`);
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal melakukan analisis.");
      }

      setAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorStatus(err.message || "Gagal menghubungkan ke server analisis karier.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Clipboard copy helper
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  // Download Cover Letter as PDF beautifully styled
  const downloadCoverLetterPDF = (rawMarkdown: string) => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(15, 23, 42); // slate 900
      doc.rect(0, 0, 210, 16, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text("CAREERPRO AI - PROFESSIONAL APPLICATION COVER LETTER", 15, 10);
      
      doc.setTextColor(33, 41, 54);
      let y = 30;
      const lines = rawMarkdown.split("\n");
      
      for (let line of lines) {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        
        const text = line.trim();
        if (text.startsWith("### ")) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.text(text.slice(4), 15, y);
          y += 8;
        } else if (text.startsWith("## ")) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.text(text.slice(3), 15, y);
          y += 10;
        } else if (text.startsWith("# ")) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.text(text.slice(2), 15, y);
          y += 12;
        } else {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10.5);
          
          const cleaned = text.replace(/\*\*/g, "");
          if (cleaned === "") {
            y += 4;
            continue;
          }
          
          const splitLines = doc.splitTextToSize(cleaned, 180);
          for (let sLine of splitLines) {
            if (y > 275) {
              doc.addPage();
              y = 20;
            }
            doc.text(sLine, 15, y);
            y += 6;
          }
        }
      }
      doc.save("Cover_Letter_CareerPro_AI.pdf");
    } catch (e) {
      console.error("PDF download failed", e);
    }
  };

  // Download Analysis competency summary report as PDF
  const downloadAnalysisPDF = (result: any) => {
    try {
      const doc = new jsPDF();
      
      // Slate header ribbon
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 18, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text("CAREERPRO AI - ATS COMPETENCY SUMMARY REPORT", 15, 11);
      
      let y = 30;
      
      // Score display block
      doc.setFillColor(248, 250, 252); // slate 50 bg
      doc.roundedRect(15, y, 180, 22, 3, 3, "FD");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text("ATS COMPATIBILITY SCORE:", 25, y + 14);
      
      doc.setFillColor(37, 99, 235); // Blue-600
      doc.roundedRect(145, y + 4, 40, 14, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text(`${result.ats_score} / 100`, 156, y + 13);
      
      y += 32;
      
      // Recruiter opinion evaluation
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("RECRUITER ALIGNMENT FIT", 15, y);
      y += 7;
      
      doc.setFont("helvetica", "oblique");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      const splitOpinion = doc.splitTextToSize(`"${result.role_insights}"`, 180);
      for (let s of splitOpinion) {
        doc.text(s, 15, y);
        y += 5.5;
      }
      
      y += 8;
      
      // Matched abilities
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(16, 124, 65);
      doc.text("MATCHED CAPABILITIES:", 15, y);
      y += 5;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      const mt = result.matched_skills?.join(", ") || "No matching items";
      const splitMatched = doc.splitTextToSize(mt, 180);
      for (let s of splitMatched) {
        doc.text(s, 15, y);
        y += 5;
      }
      
      y += 9;
      
      // Missing capabilities
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(220, 38, 38);
      doc.text("MISSING KEYWORDS (ATS GAPS):", 15, y);
      y += 5;
      
      const mist = result.missing_skills?.join(", ") || "None";
      const splitMissing = doc.splitTextToSize(mist, 180);
      for (let s of splitMissing) {
        doc.text(s, 15, y);
        y += 5;
      }
      
      y += 12;
      
      // Recommendations Strategic plan
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("ACTIONABLE REVISION STEPS", 15, y);
      y += 7;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      
      if (result.recommendations && result.recommendations.length > 0) {
        result.recommendations.forEach((rec: string, index: number) => {
          if (y > 275) {
            doc.addPage();
            y = 20;
          }
          const splitRec = doc.splitTextToSize(`${index + 1}. ${rec}`, 180);
          for (let sLine of splitRec) {
            doc.text(sLine, 15, y);
            y += 5.5;
          }
          y += 1.5;
        });
      } else {
        doc.text("Fully aligned resume.", 15, y);
      }
      
      doc.save("ATS_Competency_Summary_Report.pdf");
    } catch (e) {
      console.error("PDF compilation failed", e);
    }
  };

  // Helper score categorization styling
  const getScoreColor = (score: number) => {
    if (score >= 85) return { border: "border-green-300", text: "text-green-700", bg: "bg-green-50" };
    if (score >= 65) return { border: "border-blue-300", text: "text-blue-700", bg: "bg-blue-50" };
    if (score >= 40) return { border: "border-amber-300", text: "text-amber-800", bg: "bg-amber-50" };
    return { border: "border-rose-300", text: "text-rose-700", bg: "bg-rose-50" };
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Pure gradient and blur background lights - simulating the reference image's gorgeous glowing transition */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[620px] pointer-events-none overflow-hidden opacity-95 z-0">
        <div className="absolute -top-[120px] left-[5%] w-[450px] h-[450px] rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute -top-[100px] left-[35%] w-[500px] h-[500px] rounded-full bg-cyan-400/20 blur-[130px]" />
        <div className="absolute top-[60px] right-[5%] w-[420px] h-[420px] rounded-full bg-amber-300/20 blur-[110px]" />
        <div className="absolute top-[180px] left-[20%] w-[350px] h-[350px] rounded-full bg-lime-400/15 blur-[100px]" />
      </div>

      {/* Top Fixed Floating Navigation Header (Transparent Background) */}
      <header className="absolute top-4 md:top-6 left-0 right-0 z-50 px-4 md:px-8 pointer-events-none animate-fade-in-down">
        <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto relative">
          
          {/* Left Side: Brand Logo & Text - Background matching middle nav */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} 
            className="flex items-center space-x-2.5 cursor-pointer group bg-slate-900/65 backdrop-blur-md border border-slate-800/60 hover:bg-slate-900/80 hover:border-slate-800 px-3.5 py-1.5 md:py-2 rounded-full transition-all duration-300 shadow-xl z-20"
          >
            <div className="h-6 w-6 md:h-7 md:w-7 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/15 group-hover:scale-105 transition-transform">
              <svg className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5" opacity="0.8"/>
              </svg>
            </div>
            <span className="font-display font-bold text-xs sm:text-sm tracking-tight text-slate-100 select-none group-hover:text-white transition-colors">
              CareerPro<span className="font-sans font-normal text-[9px] md:text-[10px] align-super text-blue-300 opacity-90">AI™</span>
            </span>
          </div>

          {/* Center Column: Perfect Absolute Centering of Floating Capsule Navigation for aesthetic balance */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center bg-slate-900/65 backdrop-blur-md border border-slate-800/60 shadow-xl rounded-full py-1.5 pl-6 pr-1.5 gap-6 z-10">
            <a 
              href="#workspace" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-slate-300 hover:text-white text-xs font-semibold tracking-tight transition-colors"
            >
              {lang === "en" ? "Workspace" : "Ruang Kerja"}
            </a>
            <a 
              href="#results-panel" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("results-panel")?.scrollIntoView({ behavior: "smooth" });
                setActiveTab("analyzer"); 
              }}
              className="text-slate-300 hover:text-white text-xs font-semibold tracking-tight transition-colors"
            >
              {lang === "en" ? "ATS Insights" : "Hasil ATS"}
            </a>
            <a 
              href="#results-panel" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("results-panel")?.scrollIntoView({ behavior: "smooth" });
                setActiveTab("cover-letter");
              }}
              className="text-slate-300 hover:text-white text-xs font-semibold tracking-tight transition-colors"
            >
              {lang === "en" ? "Cover Letter" : "Surat Lamaran"}
            </a>
            
            {/* The "Try it Live" Dark Pill Button inside the capsule - matching reference image design with high contrast */}
            <button
              onClick={() => {
                document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-slate-100 hover:bg-white text-slate-950 font-bold text-xs rounded-full px-5 py-2.5 transition-all shadow hover:shadow-md active:scale-95 whitespace-nowrap cursor-pointer"
            >
              {lang === "en" ? "Try it Live" : "Coba Sekarang"}
            </button>
          </div>

          {/* Right Side Actions: Language Switcher and Actions - with matching capsule borders/background */}
          <div className="flex items-center gap-2 md:gap-3 z-20">
            
            {/* Language Switcher Pill matching the exact background and style of overall navbar */}
            <div className="hidden md:flex items-center gap-1 bg-slate-900/65 backdrop-blur-md border border-slate-800/60 p-1 rounded-full shadow-xl">
              <button
                onClick={() => setLang('id')}
                className={`transition-all rounded-full px-2.5 py-1 text-[10px] font-bold cursor-pointer ${
                  lang === 'id'
                    ? "bg-white text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-slate-100"
                }`}
              >
                ID
              </button>
              <button
                onClick={() => setLang('en')}
                className={`transition-all rounded-full px-2.5 py-1 text-[10px] font-bold cursor-pointer ${
                  lang === 'en'
                    ? "bg-white text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-slate-100"
                }`}
              >
                EN
              </button>
            </div>

            {/* Aesthetic active action button matching sign up actions (Desktop only) */}
            <button
              onClick={() => {
                document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" });
                handleInjectSampleData();
              }}
              className="hidden lg:flex items-center gap-1.5 text-slate-200 hover:text-white transition-all bg-slate-900/65 hover:bg-slate-800 border border-slate-800/60 hover:border-slate-700 font-semibold text-[11px] rounded-full py-2 px-4 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>{lang === "en" ? "Fill Sample" : "Isi Contoh"}</span>
            </button>

            {/* Mobile Menu Toggle Button - stylized as a matching dark capsule circle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-8.5 w-8.5 rounded-full bg-slate-900/65 backdrop-blur-md border border-slate-800/60 shadow-xl text-slate-300 hover:text-white active:scale-95 transition-all cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4.5 w-4.5" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute top-16 left-4 right-4 bg-white/98 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl p-5 flex flex-col gap-4 pointer-events-auto z-40 text-slate-900"
            >
              <div className="flex flex-col gap-2.5 pb-3.5 border-b border-slate-100">
                <a 
                  href="#workspace" 
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center justify-between text-slate-700 hover:text-slate-950 py-1.5 text-sm font-semibold transition-colors"
                >
                  <span>{lang === "en" ? "Workspace" : "Ruang Kerja"}</span>
                  <ArrowRight className="h-4.5 w-4.5 text-slate-400" />
                </a>
                <a 
                  href="#results-panel" 
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    document.getElementById("results-panel")?.scrollIntoView({ behavior: "smooth" });
                    setActiveTab("analyzer"); 
                  }}
                  className="flex items-center justify-between text-slate-700 hover:text-slate-950 py-1.5 text-sm font-semibold transition-colors"
                >
                  <span>{lang === "en" ? "ATS Insights" : "Hasil ATS"}</span>
                  <ArrowRight className="h-4.5 w-4.5 text-slate-400" />
                </a>
                <a 
                  href="#results-panel" 
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    document.getElementById("results-panel")?.scrollIntoView({ behavior: "smooth" });
                    setActiveTab("cover-letter");
                  }}
                  className="flex items-center justify-between text-slate-700 hover:text-slate-950 py-1.5 text-sm font-semibold transition-colors"
                >
                  <span>{lang === "en" ? "Cover Letter" : "Surat Lamaran"}</span>
                  <ArrowRight className="h-4.5 w-4.5 text-slate-400" />
                </a>
              </div>

              {/* Language Selector on Mobile */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500 font-semibold">{lang === "en" ? "Language" : "Bahasa"}</span>
                <div className="flex items-center gap-1 bg-slate-150 p-0.5 rounded-full border border-slate-200">
                  <button
                    onClick={() => { setLang('id'); setIsMobileMenuOpen(false); }}
                    className={`transition-all rounded-full px-3 py-1 text-xs font-bold ${
                      lang === 'id'
                        ? "bg-slate-950 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-950"
                    }`}
                  >
                    ID
                  </button>
                  <button
                    onClick={() => { setLang('en'); setIsMobileMenuOpen(false); }}
                    className={`transition-all rounded-full px-3 py-1 text-xs font-bold ${
                      lang === 'en'
                        ? "bg-slate-950 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-950"
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" });
                  handleInjectSampleData();
                }}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full py-2.5 shadow transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>{lang === "en" ? "Load Sample Data" : "Muat Data Contoh"}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Display section with Live Video Background - adjusted spacing */}
      <section className="relative min-h-[420px] sm:min-h-[480px] md:min-h-[520px] flex items-center justify-center text-center overflow-hidden px-4 sm:px-6 pt-32 sm:pt-40 md:pt-44 pb-16 sm:pb-20 bg-transparent">
        <div 
          className="absolute inset-0 z-0 bg-slate-950"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)"
          }}
        >
          <video
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_165750_358b1e72-c921-48b7-aaac-f200994f32fb.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-85"
          />
          {/* Subtle overlay for contrast & balance */}
          <div className="absolute inset-0 bg-slate-950/45 mix-blend-multiply" />
          
          {/* Transparent-friendly connector gradient fading seamlessly from dark video */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/50 to-transparent z-10 pointer-events-none opacity-40" />
        </div>

        <div className="max-w-4xl mx-auto flex flex-col items-center relative z-20">

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.1] tracking-tight mb-5 text-white max-w-4xl relative z-10 animate-fade-in-up" style={{ opacity: 0, animationDelay: '0.3s' }}>
            {copy[lang].headingLine1} <br />
            {lang === 'en' ? 'with ' : 'dengan '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 font-semibold">AI</span>
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base md:text-lg text-slate-100 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed relative z-10 animate-fade-in-up font-sans text-slate-200" style={{ opacity: 0, animationDelay: '0.4s' }}>
            {copy[lang].subheading}
          </p>

          {/* CTA Button */}
          <div className="relative z-10 mb-4 animate-fade-in-up" style={{ opacity: 0, animationDelay: '0.5s' }}>
            <button
              onClick={() => {
                document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-white text-slate-950 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold hover:bg-slate-100 transition-all active:scale-95 cursor-pointer shadow-lg shadow-white/10 hover:shadow-white/20"
            >
              {copy[lang].cta}
            </button>
          </div>

        </div>
      </section>

      {/* Main Dynamic Workspace Area */}
      <main id="workspace" className="max-w-7xl mx-auto px-4 md:px-8 pb-20 relative z-20">

        {/* Top Control Section */}
        <div className="mb-12">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Terminal className="h-4 w-4 text-blue-600" />
                  <h2 className="font-display font-bold text-base sm:text-lg text-slate-900">{t("inputHeader")}</h2>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    id="btn-sample-data"
                    onClick={handleInjectSampleData}
                    className="text-[10px] sm:text-xs font-mono font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/85 py-1.5 px-2 sm:px-3.5 rounded-full border border-blue-200/50 transition-all cursor-pointer flex items-center space-x-0.5 sm:space-x-1 shrink-0"
                  >
                    <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                    <span>{t("useSample")}</span>
                  </button>
                  <button
                    id="btn-clear-workspace"
                    onClick={handleClearWorkspace}
                    className="text-[10px] sm:text-xs font-mono font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/85 py-1.5 px-2 sm:px-3.5 rounded-full border border-rose-200/50 transition-all cursor-pointer flex items-center space-x-0.5 sm:space-x-1 shrink-0"
                  >
                    <X className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                    <span>{t("cleanWorkspace")}</span>
                  </button>
                </div>
              </div>

              {/* Form Input fields */}
              <div className="space-y-4">
                
                {/* Job Description TextArea */}
                <div>
                  <label className="block text-xs font-mono tracking-wider text-slate-500 uppercase mb-2 flex items-center justify-between">
                    <span>{t("jdLabel")}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{t("jdMinChar")}</span>
                  </label>
                  <textarea
                    id="input-jd"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder={t("jdPlaceholder")}
                    className="w-full h-44 rounded-xl bg-[#F8FAFC] border border-slate-200 p-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans resize-none"
                  />
                </div>

                {/* PDF Uploader Field with Drag & Drop */}
                <div>
                  <label className="block text-xs font-mono tracking-wider text-slate-500 uppercase mb-2">
                    {t("cvUploadLabel")}
                  </label>
                  <div className="relative group">
                    <input
                      key={fileName || "empty"}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <div className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                      fileName ? "border-blue-400 bg-blue-50/20" : "border-slate-250 group-hover:border-blue-500 bg-[#F8FAFC]"
                    }`}>
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className={`p-2.5 rounded-lg ${
                          fileName ? "bg-blue-100/60 text-blue-600" : "bg-slate-100 text-slate-500"
                        }`}>
                          <Upload className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">
                          {fileName ? fileName : t("cvUploadSelect")}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {fileName ? t("cvUploadedSuccess") : t("cvUploadFormats")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-center justify-center py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <span className="relative bg-white px-3 font-mono text-[10px] text-slate-400 uppercase">
                    {t("orPasteManual")}
                  </span>
                </div>

                {/* Alternative manual Text Area input */}
                <div>
                  <textarea
                    id="input-cv-text"
                    value={resumeText}
                    onChange={(e) => {
                      setResumeText(e.target.value);
                      if (e.target.value && resumeFile) {
                        setResumeFile(null);
                        setFileName("");
                      }
                    }}
                    placeholder={t("cvPastePlaceholder")}
                    className="w-full h-32 rounded-xl bg-[#F8FAFC] border border-slate-200 p-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans resize-none"
                  />
                </div>
              </div>

              {/* Error indicator */}
              {errorStatus && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorStatus}</span>
                </div>
              )}

              {/* Trigger Button action */}
              <button
                id="btn-analyze"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="w-full mt-6 h-12 rounded-xl bg-blue-600 text-white font-display font-semibold transition-all hover:bg-blue-500 disabled:bg-slate-100 disabled:text-slate-400 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 cursor-pointer z-10 relative"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>{t("btnAnalyzing")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("btnAnalyze")}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
              
              <p className="mt-4 text-xs font-sans font-medium text-slate-500 text-center px-2 leading-relaxed">
                {t("btnAnalyzeInfo")}
              </p>
            </div>
          </div>
        </div>

        {/* Tab & Results Segment (Beneath raw input and live mockup screen) */}
        <div id="results-panel" className="border-t border-slate-200 pt-10">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="text-center sm:text-left">
              <h3 className="font-display font-medium text-xl sm:text-2xl text-slate-900 tracking-tight">
                {lang === 'en' ? "AI Analysis & Documents Panel" : "Panel Analisis & Dokumen AI"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'en' ? "Explore comprehensive CV insights and draft matching documents beneath your input setup" : "Jelajahi wawasan CV lengkap dan susun dokumen kecocokan di bawah setelan masukan Anda"}
              </p>
            </div>

            {/* Structured Tab Selector bar */}
            <div className="bg-slate-100 rounded-lg p-1 flex items-center border border-slate-200/60 shrink-0">
              <button
                onClick={() => {
                  setHeroTab('cv');
                  setActiveTab('analyzer');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'analyzer'
                    ? "bg-white text-black shadow-sm font-bold"
                    : "text-slate-600 hover:text-black font-medium"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{copy[lang].tabCv}</span>
              </button>

              <div className="w-px h-4 bg-slate-300 mx-1.5" />

              <button
                onClick={() => {
                  setHeroTab('cl');
                  setActiveTab('cover-letter');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'cover-letter'
                    ? "bg-white text-black shadow-sm font-bold"
                    : "text-slate-600 hover:text-black font-medium"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{copy[lang].tabCl}</span>
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "analyzer" ? (
              <motion.div
                key="analyzer-results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Former col-span-7 loading/results UI rendered in elegant full-width layout! */}
                <div className="w-full">
                  
                  {isAnalyzing && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm flex flex-col items-center justify-center text-center h-[550px] relative overflow-hidden">
                      {/* Grid overlay animation */}
                      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
                      
                      <div className="relative flex items-center justify-center">
                        <div className="h-16 w-16 rounded-full border-2 border-t-blue-600 border-r-transparent border-b-blue-600/10 border-l-blue-600/10 animate-spin" />
                        <Sparkles className="absolute h-6 w-6 text-blue-600 animate-pulse" />
                      </div>

                      <h3 className="font-display font-bold text-lg text-slate-800 mt-8 tracking-tight">
                        {t("loadingWaiting")}
                      </h3>
                      
                      <div className="h-14 flex items-center justify-center max-w-md">
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={loadingStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-slate-500 text-sm mt-3 leading-relaxed font-mono"
                          >
                            {COACHING_TIPS[loadingStep]}
                          </motion.p>
                        </AnimatePresence>
                      </div>

                      <div className="w-64 bg-slate-100 h-1.5 rounded-full mt-8 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full transition-all duration-[3005ms]"
                          style={{ width: `${((loadingStep + 1) / COACHING_TIPS.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {!isAnalyzing && !analysisResult && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm flex flex-col items-center justify-center text-center h-[550px]">
                      <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-6">
                        <Briefcase className="h-6 w-6 text-slate-400" />
                      </div>
                      <h3 className="font-display font-bold text-slate-800 text-lg tracking-wide">
                        {t("readyTitle")}
                      </h3>
                      <p className="text-slate-500 text-sm mt-2 max-w-md leading-relaxed">
                        {t("readyDesc")}
                      </p>
                    </div>
                  )}

                  {/* Operational Dashboard Results Output */}
                  {!isAnalyzing && analysisResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6"
                    >
                      {/* Summary dashboard block */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
                        
                        {/* Title header */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-150 mb-6 w-full">
                          <div>
                            <span className="text-[10px] font-mono tracking-widest text-blue-650 font-bold">{t("resultHeader")}</span>
                            <h2 className="font-display font-bold text-xl text-slate-900">{t("resultTitle")}</h2>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <button
                              onClick={() => downloadAnalysisPDF(analysisResult)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all px-3 py-2 rounded-xl cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap animate-fade-in-up"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>{lang === 'en' ? "Download PDF" : "Unduh PDF"}</span>
                            </button>
                            <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-600 bg-slate-50 px-2.5 py-2 rounded-lg border border-slate-200 whitespace-nowrap">
                              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                              <span>{t("resultProcessed")}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bento Grid Metrics and Score Visual */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                           
                          {/* Circular Gauge Score view */}
                          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-xl bg-slate-50/50 border border-slate-200 relative">
                            <span className="text-xs font-mono text-slate-500 mb-3 block text-center uppercase tracking-wide">
                              ATS Match Score
                            </span>
                            
                            {/* SVG Interactive Circular path */}
                            <div className="relative h-36 w-36 flex items-center justify-center">
                              <svg className="absolute inset-0 h-full w-full -rotate-90">
                                <circle 
                                  cx="72" 
                                  cy="72" 
                                  r="62" 
                                  className="stroke-slate-100" 
                                  strokeWidth="10" 
                                  fill="transparent" 
                                />
                                <circle 
                                  cx="72" 
                                  cy="72" 
                                  r="62" 
                                  className={`transition-all duration-1000 ${
                                    analysisResult.ats_score >= 85 ? "stroke-green-600" : 
                                    analysisResult.ats_score >= 65 ? "stroke-blue-650" : 
                                    analysisResult.ats_score >= 40 ? "stroke-amber-500" : "stroke-rose-600"
                                  }`} 
                                  strokeWidth="10" 
                                  fill="transparent" 
                                  strokeDasharray={2 * Math.PI * 62}
                                  strokeDashoffset={2 * Math.PI * 62 * (1 - analysisResult.ats_score / 100)}
                                  strokeLinecap="round"
                                />
                              </svg>
                              
                              <div className="text-center mt-1">
                                <span className="font-display font-extrabold text-4xl text-slate-800">
                                  {analysisResult.ats_score}
                                </span>
                                <span className="text-sm font-mono text-slate-400 block mt-[-4px]">/ 100</span>
                              </div>
                            </div>

                            {/* Range classification label indicator */}
                            <div className="mt-5 text-center">
                              <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-full ${getScoreColor(analysisResult.ats_score).bg} ${getScoreColor(analysisResult.ats_score).text} border ${getScoreColor(analysisResult.ats_score).border}/50`}>
                                {analysisResult.ats_score >= 85 ? t("rankExcellent") : 
                                 analysisResult.ats_score >= 65 ? t("rankModerate") : 
                                 analysisResult.ats_score >= 40 ? t("rankRevision") : t("rankMismatch")}
                              </span>
                            </div>
                          </div>

                          {/* Evaluation Role Insights review quote */}
                          <div className="md:col-span-7 flex flex-col justify-center">
                            <h4 className="text-xs font-mono text-blue-600 mb-2 uppercase tracking-wider font-bold">
                              {t("insightHeader")}
                            </h4>
                            <div className="relative bg-slate-50 p-5 rounded-xl border border-slate-200 before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1 before:bg-blue-600 before:rounded-full">
                              <p className="text-sm text-slate-700 leading-relaxed italic pr-2 font-sans">
                                "{analysisResult.role_insights}"
                              </p>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-[10px] font-mono text-slate-400 uppercase">AI RECRUITER OPINION</span>
                                <span className="text-[11px] font-mono text-slate-655 font-bold bg-slate-200/60 px-2 py-0.5 rounded">{t("fitRating")}</span>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Skill matrices grid list */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-150">
                          
                          {/* Matched Skills List */}
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2 pb-1.5 border-b border-slate-150">
                              <div className="h-5 w-5 rounded-full bg-green-50 flex items-center justify-center border border-green-200">
                                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                              </div>
                              <span className="text-xs font-mono uppercase tracking-wider text-green-700 font-bold">
                                {t("matchedSkills")}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {analysisResult.matched_skills && analysisResult.matched_skills.length > 0 ? (
                                analysisResult.matched_skills.map((skill: string, index: number) => (
                                  <span key={index} className="text-xs font-mono px-2.5 py-1 rounded-lg bg-green-50 text-green-705 border border-green-150/80">
                                    {skill}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400 font-mono italic">{t("noMatchedSkills")}</span>
                              )}
                            </div>
                          </div>

                          {/* Missing Skills List */}
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2 pb-1.5 border-b border-slate-150">
                              <div className="h-5 w-5 rounded-full bg-orange-50 flex items-center justify-center border border-orange-200">
                                <AlertTriangle className="h-3.5 w-3.5 text-orange-605" />
                              </div>
                              <span className="text-xs font-mono uppercase tracking-wider text-orange-705 font-bold">
                                {t("missingSkills")}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {analysisResult.missing_skills && analysisResult.missing_skills.length > 0 ? (
                                analysisResult.missing_skills.map((skill: string, index: number) => (
                                  <span key={index} className="text-xs font-mono px-2.5 py-1 rounded-lg bg-orange-50/80 text-orange-705 border border-orange-150">
                                    {skill}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400 font-mono italic">{t("noMissingSkills")}</span>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* ATS Keyword Heatmap */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 animate-fade-in-up">
                        <div className="flex items-center space-x-2 pb-3 border-b border-slate-150">
                          <BarChart3 className="h-4.5 w-4.5 text-blue-600" />
                          <h3 className="font-display font-bold text-md text-slate-900">
                            {lang === "en" ? "ATS Keyword Heatmap" : "Visualisasi Heatmap Kata Kunci ATS"}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-sans mt-1">
                          {lang === "en" 
                            ? "Green words represent matching priority competencies found in your CV. Red items highlight high-impact missing keywords to insert for maximum compatibility." 
                            : "Hijau menandakan kualifikasi utama yang sudah terdeteksi di CV Anda. Merah mengidentifikasi kata kunci krusial yang perlu disisipkan untuk optimalisasi penuh."}
                        </p>
                        <div className="flex flex-wrap gap-2 sm:gap-2.5 pt-2">
                          {analysisResult.matched_skills?.map((skill: string, idx: number) => (
                            <div key={`match-${idx}`} className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm transition-all hover:scale-[1.02] hover:bg-emerald-100/50">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="text-xs font-semibold text-emerald-800" title={skill}>{skill}</span>
                            </div>
                          ))}
                          {analysisResult.missing_skills?.map((skill: string, idx: number) => (
                            <div key={`missing-${idx}`} className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 shadow-sm transition-all hover:scale-[1.02] hover:bg-rose-100/50">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                              <span className="text-xs font-semibold text-rose-800" title={skill}>{skill}</span>
                            </div>
                          ))}
                          {(!analysisResult.matched_skills?.length && !analysisResult.missing_skills?.length) && (
                            <span className="text-xs text-slate-400 font-mono italic w-full py-4 text-center">No keywords detected</span>
                          )}
                        </div>
                      </div>

                      {/* Structural Strengths & Actionable Recommendations */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Strengths card */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                          <div className="flex items-center space-x-2 pb-3 border-b border-slate-150">
                            <Sparkles className="h-4.5 w-4.5 text-green-600" />
                            <h3 className="font-display font-bold text-md text-slate-900">{t("strengthsHeader")}</h3>
                          </div>
                          
                          <ul className="space-y-3">
                            {analysisResult.strengths && analysisResult.strengths.length > 0 ? (
                              analysisResult.strengths.map((str: string, index: number) => (
                                <li key={index} className="flex items-start space-x-3 text-sm text-slate-600">
                                  <span className="h-5 w-5 rounded bg-green-50 text-green-700 border border-green-200/50 text-xs font-bold shrink-0 mt-0.5 flex items-center justify-center">
                                    ✓
                                  </span>
                                  <span className="leading-relaxed font-semibold">{str}</span>
                                </li>
                              ))
                            ) : (
                              <p className="text-xs text-slate-400 italic">{t("noStrengths")}</p>
                            )}
                          </ul>
                        </div>

                        {/* Recommendations card styled in Professional Polish layout format (bg-slate-900 contrast) */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 text-white p-6 shadow-xl space-y-4">
                          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
                            <ListTodo className="h-4.5 w-4.5 text-blue-400" />
                            <h3 className="font-display font-bold text-md text-white">{t("recommHeader")}</h3>
                          </div>
                          
                          <div className="space-y-4">
                            {analysisResult.recommendations && analysisResult.recommendations.length > 0 ? (
                              analysisResult.recommendations.map((rec: string, index: number) => (
                                <div key={index} className="flex items-start space-x-4">
                                  {/* Big serial numbers like reference image */}
                                  <span className="font-display font-bold text-lg text-blue-400 tracking-wider leading-none mt-1 min-w-[24px]">
                                    {String(index + 1).padStart(2, "0")}
                                  </span>
                                  <div className="space-y-0.5">
                                    <p className="text-sm text-slate-300 leading-relaxed font-sans">
                                      {rec}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-slate-400 italic">{t("noRecomm")}</p>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Detailed Full Report with Markdown text representation */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-150 mb-4">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4.5 w-4.5 text-blue-600" />
                            <h3 className="font-display font-bold text-md text-slate-800">{t("fullReportHeader")}</h3>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">{t("interactiveReportView")}</span>
                        </div>

                        {/* Styled report viewport */}
                        <div className="bg-[#F8FAFC] border border-slate-250 p-5 rounded-xl max-h-96 overflow-y-auto font-sans text-sm text-slate-700 leading-relaxed space-y-4">
                          {analysisResult.ats_report_markdown ? (
                            <div className="prose prose-slate prose-sm max-w-none">
                              {analysisResult.ats_report_markdown.split("\n").map((line: string, index: number) => {
                                if (line.startsWith("### ")) {
                                  return (
                                    <h4 key={index} className="text-sm font-display font-bold text-slate-900 uppercase tracking-wider mt-5 mb-2 border-b border-slate-200 pb-1">
                                      {line.slice(4)}
                                    </h4>
                                  );
                                }
                                if (line.startsWith("## ")) {
                                  return (
                                    <h3 key={index} className="text-md font-display font-extrabold text-blue-600 uppercase tracking-wide mt-6 mb-3">
                                      {line.slice(3)}
                                    </h3>
                                  );
                                }
                                if (line.startsWith("# ")) {
                                  return (
                                    <h2 key={index} className="text-lg font-display font-bold text-slate-900 tracking-tight mt-6 mb-4">
                                      {line.slice(2)}
                                    </h2>
                                  );
                                }
                                if (line.startsWith("- ") || line.startsWith("* ")) {
                                  return (
                                    <p key={index} className="flex items-start space-x-2 pl-3 py-0.5 text-slate-600 font-medium">
                                      <span className="text-blue-600 font-bold shrink-0 mt-0.5">•</span>
                                      <span>{line.slice(2)}</span>
                                    </p>
                                  );
                                }
                                if (line.trim() === "") {
                                  return <div key={index} className="h-2" />;
                                }
                                return <p key={index} className="text-slate-650">{line}</p>;
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">{t("noReport")}</p>
                          )}
                        </div>
                      </div>

                    </motion.div>
                  )}

                </div>
              </motion.div>
          ) : (
            // Modern Elegant Custom-Built Cover Letter Generator
            <motion.div
              key="cover-letter"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200 mb-6">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 uppercase flex items-center gap-1 w-fit">
                      <Mail className="h-3 w-3 text-blue-600" />
                      <span>PERSUASIVE WRITER</span>
                    </span>
                    <h2 className="font-display font-bold text-xl text-slate-900 mt-2">{t("clTitle")}</h2>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                      {t("clSubtitle")}
                    </p>
                  </div>

                  <div>
                    <button
                      onClick={handleGenerateCoverLetter}
                      disabled={isGeneratingCoverLetter}
                      className={`w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer shadow-md shadow-blue-500/10 ${
                        isGeneratingCoverLetter
                          ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
                      }`}
                    >
                      {isGeneratingCoverLetter ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>{t("clBtnGenerating")}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>{t("clBtnGenerate")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {coverLetterError && (
                  <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 font-sans text-xs text-rose-700 flex items-start space-x-3 mb-6">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                    <div>
                      <span className="font-bold">Error:</span>
                      <p className="mt-1 font-medium">{coverLetterError}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left explanation / tip helper */}
                  <div className="lg:col-span-4 space-y-4">
                    <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <span>{t("clTipsHeader")}</span>
                    </span>
                    
                    <div className="rounded-xl border border-slate-150 bg-[#F8FAFC]/80 p-5 space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-800 block">1. {t("clTip1Title")}</span>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                          {t("clTip1Desc")}
                        </p>
                      </div>
                      
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-800 block">2. {t("clTip2Title")}</span>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                          {t("clTip2Desc")}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-800 block">3. {t("clTip3Title")}</span>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                          {t("clTip3Desc")}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-blue-50 bg-blue-50/20 p-4 text-xs space-y-1.5 text-blue-800">
                      <span className="font-sans font-bold flex items-center space-x-1.5 text-blue-700">
                        <Zap className="h-3.5 w-3.5" />
                        <span>{t("clSnergyTitle")}</span>
                      </span>
                      <p className="leading-relaxed text-slate-600 font-semibold font-sans">
                        {t("clSnergyDesc")}
                      </p>
                    </div>
                  </div>

                  {/* Generated Cover letter display content editor */}
                  <div className="lg:col-span-8 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-2 sm:pb-0">
                      <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <FileText className="h-4 w-4 text-slate-500" />
                        <span>{t("clResultHeader")}</span>
                      </span>
                      {coverLetterText && (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => downloadCoverLetterPDF(coverLetterText)}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-xs font-sans font-semibold border border-slate-800 transition-all text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>{lang === "en" ? "Download PDF" : "Unduh PDF"}</span>
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(coverLetterText);
                              setCopiedStatus(true);
                              setTimeout(() => setCopiedStatus(false), 2000);
                            }}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-xs font-sans font-semibold border border-slate-200 hover:border-blue-400 transition-all text-slate-600 hover:text-blue-600 cursor-pointer"
                          >
                            {copiedStatus ? (
                              <>
                                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                <span className="text-green-600 font-bold">{t("clBtnCopied")}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>{t("clBtnCopy")}</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {coverLetterText ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 md:p-8 font-sans text-sm text-slate-700 leading-relaxed shadow-inner max-h-[600px] overflow-y-auto space-y-4">
                        {coverLetterText.split("\n").map((line, index) => {
                          if (line.startsWith("## ") || line.startsWith("### ")) {
                            return (
                              <h3 key={index} className="text-md font-display font-extrabold text-blue-600 tracking-tight mt-4 mb-2">
                                {line.replace(/[\#\*]/g, "").trim()}
                              </h3>
                            );
                          }
                          if (line.startsWith("# ")) {
                            return (
                              <h2 key={index} className="text-lg font-display font-bold text-slate-900 tracking-tight mt-6 mb-3">
                                {line.replace(/[\#\*]/g, "").trim()}
                              </h2>
                            );
                          }
                          if (line.startsWith("- ") || line.startsWith("* ")) {
                            return (
                              <p key={index} className="flex items-start space-x-2 pl-3 py-0.5 text-slate-655 font-medium">
                                <span className="text-blue-600 font-bold shrink-0 mt-0.5">•</span>
                                <span>{line.replace(/^[-*]\s+/, "")}</span>
                              </p>
                            );
                          }
                          if (line.trim() === "") {
                            return <div key={index} className="h-3" />;
                          }
                          
                          // Render formatted text beautifully with bold parts parsed out
                          if (line.includes("**")) {
                            const parts = line.split("**");
                            return (
                              <p key={index} className="text-slate-655 leading-relaxed font-sans">
                                {parts.map((part, pIdx) => (
                                  pIdx % 2 === 1 ? <strong key={pIdx} className="text-slate-900 font-bold">{part}</strong> : part
                                ))}
                              </p>
                            );
                          }

                          return <p key={index} className="text-slate-655 leading-relaxed font-sans">{line}</p>;
                        })}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-[#F8FAFC]/50 p-12 text-center text-slate-400 space-y-4 flex flex-col items-center justify-center min-h-[350px]">
                        <Mail className="h-12 w-12 text-slate-300 stroke-1" />
                        <div className="max-w-md">
                          <span className="font-bold text-slate-700 block text-sm">{t("clNotGenerated")}</span>
                          <p className="text-xs text-slate-400 leading-relaxed mt-1">
                            {t("clNotGeneratedDesc")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </main>

      {/* Simple Clean Aesthetic Footer */}
      <footer className="bg-slate-50 border-t border-slate-200/50 py-8 relative z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo and App Name */}
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full bg-slate-900 flex items-center justify-center">
              <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5" opacity="0.8"/>
              </svg>
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-slate-800 select-none">
              CareerPro AI
            </span>
          </div>

          {/* Copyright Info */}
          <p className="text-xs text-slate-400 font-medium font-sans">
            &copy; 2026 Azka. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
