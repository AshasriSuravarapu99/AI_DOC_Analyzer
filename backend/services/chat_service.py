import os
from google import genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ChatService:
    def __init__(self, document_service):
        self.document_service = document_service
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("CRITICAL ERROR: GEMINI_API_KEY is missing. Please set it in the backend/.env file.")
        self.client = genai.Client(api_key=api_key)

    def generate_answer(self, question: str, document_id: str = None) -> dict:
        # 1. Retrieve relevant chunks from the vector database
        relevant_chunks = self.document_service.query_documents(question, document_id)
        
        if not relevant_chunks:
            return {
                "answer": "I couldn't find any information in the uploaded document to answer that question. Please ensure a document is uploaded first.",
                "sources": []
            }
            
        # 2. Construct the prompt with the retrieved context
        context_parts = []
        sources = []
        for i, chunk_data in enumerate(relevant_chunks):
            text = chunk_data["text"]
            metadata = chunk_data["metadata"]
            page_num = metadata.get("page", "Unknown")
            filename = metadata.get("filename", "Unknown")
            
            context_parts.append(f"--- Excerpt {i+1} (Source: {filename}, Page: {page_num}) ---\n{text}\n")
            
            sources.append({
                "text": text,
                "page": page_num,
                "filename": filename
            })
            
        context = "\n".join(context_parts)
        
        prompt = f"""You are DocMind, a helpful AI assistant.

Rules for answering:
1. Answer ONLY using the provided Document Context.
2. DO NOT use outside knowledge under any circumstances.
3. If the answer cannot be found in the context, you MUST reply exactly with: "I could not find this in the uploaded document."
4. Keep your answers clear and beginner-friendly.
5. When providing facts from the context, cite the page number they came from in parentheses, e.g., (Page X).

Document Context:
{context}

Question:
{question}
"""

        # 3. Call Google Gemini API
        try:
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            return {
                "answer": response.text,
                "sources": sources
            }
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            raise Exception("Failed to generate answer from the LLM.")

    def test_connection(self) -> dict:
        try:
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents="Hello, just testing the connection! Say 'Connection Successful' if you can read this."
            )
            return {"status": "ok", "message": "Gemini API connected successfully", "response": response.text}
        except Exception as e:
            raise Exception(f"Gemini API Error: {str(e)}")
