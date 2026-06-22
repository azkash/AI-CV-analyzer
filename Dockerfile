# Menggunakan Python resmi sebagai base image
FROM python:3.10-slim

# Atur environment variables agar Python berjalan secara efisien
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=3000

# Set working directory di dalam container
WORKDIR /app

# Instal dependensi sistem yang diperlukan
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Salin file requirements.txt terlebih dahulu untuk efisiensi caching docker layer
COPY requirements.txt .

# Instal dependensi Python
RUN pip install --no-cache-dir -r requirements.txt

# Salin seluruh kode aplikasi ke dalam container
COPY . .

# Port 3000 adalah port wajib untuk integrasi Cloud Run di AI Studio
EXPOSE 3000

# Jalankan aplikasi streamlit
CMD ["streamlit", "run", "app.py", "--server.port=3000", "--server.address=0.0.0.0"]
