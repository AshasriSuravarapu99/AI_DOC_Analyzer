# 📄 DocMind - AI Document Analyzer

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)

**DocMind** is a full-stack, AI-powered document analysis application. It allows users to upload PDF documents, intelligently parses and chunks the text, embeds it into a local vector database, and leverages the power of the Google Gemini API to answer natural language questions based directly on the uploaded document's context.

---

## ✨ Key Features

- **📄 Seamless PDF Processing**: Fast and reliable PDF text extraction.
- **🧠 Intelligent Chunking & Embedding**: Uses `sentence-transformers/all-MiniLM-L6-v2` to create high-quality vector embeddings of your document chunks.
- **🔍 Vector Database**: Integrates `ChromaDB` for hyper-fast semantic search and context retrieval.
- **🤖 Powered by Gemini**: Uses the `Google Gemini API` as the LLM engine to synthesize answers accurately based on the retrieved context.
- **🐳 Fully Dockerized**: Single-command startup using Docker Compose. Lightweight CPU-only PyTorch optimization ensures rapid and stable builds.
- **💅 Modern UI**: A clean, responsive frontend built with React, Vite, and Tailwind CSS.

---

## 🛠️ Tech Stack

| Component         | Technology |
|-------------------|------------|
| **Frontend**      | React, Vite, Tailwind CSS |
| **Backend API**   | Python FastAPI, Uvicorn |
| **Vector DB**     | ChromaDB |
| **Embeddings**    | HuggingFace `sentence-transformers` |
| **LLM Engine**    | Google GenAI SDK (Gemini) |
| **PDF Parser**    | pypdf |
| **Deployment**    | Docker, Docker Compose, Nginx |

---

## 🚀 Getting Started

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/AI-Document-analyzer.git
cd AI-Document-analyzer
```

### 2. Configure Environment Variables
Navigate to the `backend` directory and create a `.env` file from the example template:
```bash
cp backend/.env.example backend/.env
```
Open `backend/.env` and add your Gemini API Key:
```env
GEMINI_API_KEY="your_actual_api_key_here"
```

### 3. Run with Docker
The easiest way to run the entire stack (Frontend + Backend + Nginx) is via Docker Compose:
```bash
docker-compose up --build
```
> **Note:** The initial build may take a few minutes as it downloads dependencies and pre-caches the embedding model.

### 4. Access the Application
- **Frontend UI:** [http://localhost:5173](http://localhost:5173)
- **Backend API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔌 API Endpoints

The backend exposes a fully documented REST API. Here are the core endpoints:

- `GET /health` - Check if the API is running.
- `GET /test-gemini` - Verify the Gemini API key is configured and working.
- `POST /upload` - Upload a `.pdf` file. The file is processed, chunked, embedded, and stored in ChromaDB.
- `POST /ask` - Submit a natural language question. The API searches the vector DB for context and returns a generated answer.

---

## 👨‍💻 Local Development (Without Docker)

If you prefer to run the services manually without Docker:

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## ☁️ Deployment

### Deploying the Backend (Render)
1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your GitHub repository.
3. Set the Root Directory to `backend`.
4. Choose **Docker** as the Environment. Render will automatically detect the `Dockerfile` and build it.
5. In the Environment Variables section, add:
   - `GEMINI_API_KEY`: Your Gemini API Key.
6. Click **Deploy**. Once deployed, copy your backend URL (e.g., `https://docmind-backend.onrender.com`).

### Deploying the Frontend (Vercel)
1. Create a new Project on [Vercel](https://vercel.com/) and import your repository.
2. Set the Framework Preset to **Vite** (or let Vercel auto-detect it).
3. Set the Root Directory to `frontend`.
4. In the Environment Variables section, add:
   - `VITE_API_URL`: Your deployed backend URL (e.g., `https://docmind-backend.onrender.com`).
5. Click **Deploy**. Your frontend will be built and hosted globally.

---

## 📝 License

This project is open-source and available under the MIT License.
