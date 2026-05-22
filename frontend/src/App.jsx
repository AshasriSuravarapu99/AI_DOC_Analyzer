import { useState, useEffect } from 'react';
import axios from 'axios';
import UploadSection from './components/UploadSection';
import ChatInterface from './components/ChatInterface';
import { Bot, FileText, Sparkles, BookOpen, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [documents, setDocuments] = useState([]);
  const [activeDocumentId, setActiveDocumentId] = useState(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  const fetchDocuments = async () => {
    try {
      setIsLoadingDocs(true);
      const res = await axios.get(`${API_URL}/documents`);
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error("Failed to fetch documents", err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadSuccess = (name, docId) => {
    fetchDocuments();
    setActiveDocumentId(docId);
  };

  const handleDelete = async (e, docId) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_URL}/documents/${docId}`);
      if (activeDocumentId === docId) {
        setActiveDocumentId(null);
      }
      fetchDocuments();
    } catch (err) {
      console.error("Failed to delete document", err);
    }
  };

  const activeDoc = documents.find(d => d.document_id === activeDocumentId);

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col md:flex-row overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000 pointer-events-none"></div>

      {/* Sidebar */}
      <aside className="w-full md:w-[380px] h-auto md:h-screen glass-panel z-10 flex flex-col border-r border-dark-border shadow-2xl">
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-dark-muted">DocMind</h1>
            </div>
          </div>
          <p className="text-sm text-dark-muted font-medium">AI Document Analyzer & Q&A Assistant</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 scrollbar-hide">
          {/* Upload Section */}
          <section>
            <h2 className="text-sm font-semibold text-dark-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Upload Document
            </h2>
            <UploadSection onUploadSuccess={handleUploadSuccess} />
          </section>

          {/* Document List */}
          <section className="flex-1">
            <h2 className="text-sm font-semibold text-dark-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Your Documents
            </h2>
            
            {isLoadingDocs ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-dark-border rounded-xl">
                <p className="text-sm text-dark-muted">No documents uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div 
                    key={doc.document_id}
                    onClick={() => setActiveDocumentId(doc.document_id)}
                    className={`group cursor-pointer p-3 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                      activeDocumentId === doc.document_id 
                        ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' 
                        : 'bg-dark-bg border-dark-border hover:border-dark-muted hover:bg-dark-panel'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className={`w-5 h-5 shrink-0 ${activeDocumentId === doc.document_id ? 'text-primary' : 'text-dark-muted'}`} />
                      <span className={`text-sm truncate font-medium ${activeDocumentId === doc.document_id ? 'text-primary' : 'text-dark-text'}`}>
                        {doc.filename}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, doc.document_id)}
                      className="p-1.5 rounded-lg text-dark-muted opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 transition-all"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen flex flex-col relative z-0 p-4 md:p-6 lg:p-8">
        {activeDocumentId ? (
          <div className="flex-1 flex flex-col h-full bg-dark-panel/40 backdrop-blur-sm border border-dark-border rounded-2xl overflow-hidden shadow-2xl relative">
            {/* Header for active chat */}
            <div className="h-14 border-b border-dark-border bg-dark-panel/80 flex items-center px-6">
              <p className="text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Chatting about: <span className="text-primary truncate max-w-[300px]">{activeDoc?.filename}</span>
              </p>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <ChatInterface documentId={activeDocumentId} />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in-up">
            <div className="w-24 h-24 mb-8 rounded-3xl bg-gradient-to-tr from-primary/20 to-purple-600/20 flex items-center justify-center relative">
              <Bot className="w-12 h-12 text-primary" />
              <div className="absolute top-0 right-0 w-4 h-4 bg-purple-500 rounded-full animate-ping"></div>
            </div>
            <h2 className="text-3xl font-bold mb-4">Welcome to DocMind</h2>
            <p className="text-dark-muted text-lg max-w-md mx-auto">
              Select a document from the sidebar or upload a new PDF to start extracting answers instantly.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
