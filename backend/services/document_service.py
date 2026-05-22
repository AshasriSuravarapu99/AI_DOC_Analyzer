import os
import uuid
from pypdf import PdfReader
import chromadb
from sentence_transformers import SentenceTransformer

class DocumentService:
    def __init__(self):
        # We use Chroma's PersistentClient so data is saved to disk
        os.makedirs("chroma_db", exist_ok=True)
        self.chroma_client = chromadb.PersistentClient(path="./chroma_db")
        self.collection_name = "docmind_collection"
        
        # Initialize embedding model
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
    def _get_collection(self):
        return self.chroma_client.get_or_create_collection(name=self.collection_name)

    def process_document(self, file_path: str, original_filename: str):
        collection = self._get_collection()
        document_id = str(uuid.uuid4())
        
        # 1. Parse PDF
        reader = PdfReader(file_path)
        
        chunk_size = 1000
        overlap = 200
        
        all_chunks = []
        all_ids = []
        all_metadatas = []
        
        global_chunk_idx = 0
        
        # 2. Chunk text per page to maintain page numbers
        for page_num, page in enumerate(reader.pages):
            text = page.extract_text()
            if not text:
                continue
                
            start = 0
            while start < len(text):
                end = start + chunk_size
                chunk = text[start:end]
                
                if len(chunk.strip()) > 50: # Ignore very small chunks
                    all_chunks.append(chunk)
                    all_ids.append(f"{document_id}_{global_chunk_idx}")
                    all_metadatas.append({
                        "document_id": document_id,
                        "filename": original_filename,
                        "page": page_num + 1  # 1-indexed pages
                    })
                    global_chunk_idx += 1
                
                start += chunk_size - overlap
                
        if not all_chunks:
            raise ValueError("No text could be extracted from the document.")

        # 3. Generate embeddings and store in Chroma
        all_embeddings = self.embedding_model.encode(all_chunks).tolist()
        
        collection.add(
            embeddings=all_embeddings,
            documents=all_chunks,
            metadatas=all_metadatas,
            ids=all_ids
        )
        
        return {"document_id": document_id, "filename": original_filename}

    def get_all_documents(self):
        collection = self._get_collection()
        results = collection.get(include=["metadatas"])
        
        docs = {}
        if results and results.get("metadatas"):
            for meta in results["metadatas"]:
                doc_id = meta.get("document_id")
                if doc_id and doc_id not in docs:
                    docs[doc_id] = {
                        "document_id": doc_id,
                        "filename": meta.get("filename")
                    }
                
        return list(docs.values())

    def delete_document(self, document_id: str):
        collection = self._get_collection()
        collection.delete(where={"document_id": document_id})

    def query_documents(self, query: str, document_id: str = None, n_results: int = 5):
        collection = self._get_collection()
        
        query_embedding = self.embedding_model.encode(query).tolist()
        
        where_clause = None
        if document_id:
            where_clause = {"document_id": document_id}
            
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=where_clause
        )
        
        retrieved_chunks = []
        if results['documents'] and results['documents'][0]:
            for i in range(len(results['documents'][0])):
                retrieved_chunks.append({
                    "text": results['documents'][0][i],
                    "metadata": results['metadatas'][0][i]
                })
                
        return retrieved_chunks
